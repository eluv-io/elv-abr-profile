// parametricLadderModel.js
// Data validator for Parametric Ladder data structure

// --------------------------------------
// internal modules
// --------------------------------------

const M = require('../lib/models')

const RSM = require('./rungSpecModel')

// --------------------------------------
// internal functions
// --------------------------------------


const assertMaxGTEMin = prefix => M.validateGTE_withMessage(
  `${prefix}Max`,
  `${prefix}Min`,
  true,
  'ParametricLadder.limits: ')


// --------------------------------------
// exported functions
// --------------------------------------

const PLOptionsModel = M.SealedModel({
  upscale: Boolean,
  snapAR: Boolean,
  maxARSnap: M.BoundedNumberModel(0, 1, true, false),
  minDimStepdown: M.BoundedNumberModel(0, 1, true, false),
  frameRateScaleFactor: M.BoundedNumberModel(0, 1, true, true)
}).as('PLOptionsModel')

const PLLimitsModel = M.SealedModel({
  aspectRatioMax: [M.FractionStringModel],
  aspectRatioMin: [M.FractionStringModel],
  avgBitrateMax: [M.PositiveIntegerModel],
  avgBitrateMin: [M.PositiveIntegerModel],
  fileSizeMax: [M.PositiveIntegerModel],
  fileSizeMin: [M.PositiveIntegerModel],
  durationMax: [M.PositiveIntegerModel],
  durationMin: [M.PositiveIntegerModel],
  finalBitrateMax: [M.PositiveIntegerModel],
  frameRateMax: [M.FractionStringModel],
  frameRateMin: [M.FractionStringModel],
  heightMax: [M.PositiveIntegerModel],
  heightMin: [M.PositiveIntegerModel],
  sampleAspectRatioMax: [M.FractionStringModel],
  sampleAspectRatioMin: [M.FractionStringModel],
  widthMax: [M.PositiveIntegerModel],
  widthMin: [M.PositiveIntegerModel],
})
  .assert(...assertMaxGTEMin('aspectRatio'))
  .assert(...assertMaxGTEMin('avgBitrate'))
  .assert(...assertMaxGTEMin('fileSize'))
  .assert(...assertMaxGTEMin('duration'))
  .assert(...assertMaxGTEMin('frameRate'))
  .assert(...assertMaxGTEMin('height'))
  .assert(...assertMaxGTEMin('sampleAspectRatio'))
  .assert(...assertMaxGTEMin('width'))
  .as('ParametricLadderLimits')

// ParametricLadderModel :: a -> ObjectModel | *exception*
// Returns either an ObjectModel instance containing parametric ladder info or throws an exception
const ParametricLadderModel = M.ObjectModel({
  baseAspectRatio: M.FractionStringModel, // TODO: BoundedFractionStringModel(1,null,true,null)
  baseFrameRate: M.FractionStringModel,   // TODO: PositiveFractionStringModel
  rungSpecs: RSM.RungSpecListModel,
  options: PLOptionsModel,
  limits: [PLLimitsModel]
})

module.exports = {
  ParametricLadderModel,
  PLLimitsModel,
  PLOptionsModel
}

// ElvLadderSpecs.js
//
// Utility to generate an ABR Profile ladder_specs object for a given ingest video from a parametric ladder spec and
// a list of standard aspect ratios.
//
// Also provides a default parametric ladder, default list of standard aspect ratios, and an example default set of
// video properties

// --------------------------------------
// external modules
// --------------------------------------

const liftA2 = require('crocks/helpers/liftA2')
const liftA3 = require('crocks/helpers/liftA3')
const R = require('ramda')

// --------------------------------------
// internal modules
// --------------------------------------

const AR = require('./lib/aspectRatio')
const ARLM = require('./models/aspectRatioListModel')
const M = require('./lib/models')
const PL = require('./lib/parametricLadder')
const PLM = require('./models/parametricLadderModel')
const LS = require('./lib/ladderSpecs')
const LSM = require('./models/ladderSpecsModel')
const V = require('./lib/videoProps')
const VPM = require('./models/videoPropsModel')

// --------------------------------------
// exported functions
// --------------------------------------

// VideoLadderSpecs :: VideoProps => ParametricLadder => AspectRatioList => Object
//
// Tries to prepare an object with only a 'ladder_specs' property with a single entry (with key specifically
// for aspect ratio computed from videoProps), suitable for merging into an ABR Profile.
//
// If the preparation succeeds, then returns:
//   {
//      ok: true,
//      result: {ladder_specs: OBJECT_WITH_1_VIDEO_LADDER_SPEC}
//   }
//
// If the preparation fails, then returns:
//   {
//      ok: false,
//      errors: ARRAY_OF_ERROR_MESSAGES
//   }
//
const VideoLadderSpecs = (videoProps = V.EXAMPLE, parametricLadder = PL.DEFAULT, standardAspectRatios = AR.STANDARDS) => {
  const checkedVideoProps = M.validator(VPM.VideoPropsModel)(videoProps)
  const checkedParametricLadder = M.validator(PLM.ParametricLadderModel)(parametricLadder)
  const checkedStandardAspectRatios = M.validator(ARLM.LandscapeAspectRatioListModel)(standardAspectRatios)

  const result =
    liftA2(
      LS.fromParametricLadder,
      checkedVideoProps,
      liftA3(
        PL.computeValues,
        checkedStandardAspectRatios,
        checkedParametricLadder,
        checkedVideoProps
      )
    ).chain(M.validator(LSM.LadderSpecsModel))

  return result.either(
    errVal => Object({ok: false, errors: R.flatten(errVal.map(R.prop('message')).map(R.split('\n')))}),
    okVal => Object({ok: true, result: okVal})
  )
}

module.exports = {
  DEFAULT_PARAMETRIC_LADDER: PL.DEFAULT,
  DEFAULT_STANDARD_ASPECT_RATIOS: AR.STANDARDS,
  DEFAULT_VIDEO_PROPERTIES: V.EXAMPLE,
  VideoLadderSpecs
}

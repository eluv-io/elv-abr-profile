const chai = require('chai')
chai.should()

// noinspection JSCheckFunctionSignatures
chai.use(require('chai-things'))
// const expect = chai.expect

const R = require('ramda')

const ABR = require('../src/ElvABRProfile')
const {dump} = require('../src/lib/utils')

const DEFAULT_VIDEO_LADDER_SPEC = require('./fixtures/video-ladder-spec-default')
const PM_SOURCES_TEST_MP4 = require('./fixtures/production-master-sources-test-mp4')
const PM_VARIANT_TEST_MP4 = require('./fixtures/production-master-variant-test-mp4')

describe('VideoLadderSpecs', function () {

  const ls = ABR.VideoLadderSpecs()

  if (!ls.ok) dump(ls)

  it('should return a valid ladder spec when called without any arguments',
    () => ls.ok.should.be.true)

  it('should return the expected default video ladder spec when called without any arguments',
    () => R.equals(ls.result, DEFAULT_VIDEO_LADDER_SPEC).should.be.true)


})

describe('ABRProfileForVariant', function () {
  it('should return a valid ABR profile when called with valid production master info',
    () => {
      const abrProfile = ABR.ABRProfileForVariant(PM_SOURCES_TEST_MP4, PM_VARIANT_TEST_MP4)

      if (!abrProfile.ok) dump(abrProfile)

      abrProfile.ok.should.be.true
      const topVideoRung = abrProfile.result
        .ladder_specs['{"media_type":"video","aspect_ratio_height":9,"aspect_ratio_width":16}']
        .rung_specs[0]

      topVideoRung
        .bit_rate
        .should.equal(12600000)
    })

  it('should return a valid ABR profile when called with audio-only production master info',
    () => {
      const pmVariant = R.dissocPath(['streams', 'video'], PM_VARIANT_TEST_MP4)
      const abrProfile = ABR.ABRProfileForVariant(PM_SOURCES_TEST_MP4, pmVariant)

      if (!abrProfile.ok) dump(abrProfile)

      abrProfile.ok.should.be.true
      const audioStereoRung = abrProfile.result
        .ladder_specs['{"media_type":"audio","channels":2}']
        .rung_specs[0]

      audioStereoRung
        .bit_rate
        .should.equal(256000)
    })

  it('should return ok: false when called with bad video source parameters',
    () => {
      const bad_sources = R.assocPath(['test.mp4', 'streams', 0, 'frame_rate'], '0', PM_SOURCES_TEST_MP4)
      const abrProfile = ABR.ABRProfileForVariant(bad_sources, PM_VARIANT_TEST_MP4)
      abrProfile.ok.should.be.false
      dump(abrProfile)
    }
  )
})

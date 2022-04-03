const chai = require('chai')
chai.should()

// noinspection JSCheckFunctionSignatures
chai.use(require('chai-things'))
// const expect = chai.expect

const R = require('ramda')

const ABR = require('../src/ElvABRProfile')

const DEFAULT_VIDEO_LADDER_SPEC = require('./fixtures/video-ladder-spec-default')

describe('VideoLadderSpecs', function () {

  const ls = ABR.VideoLadderSpecs()

  it('should return a valid ladder spec when called without any arguments',
    () => ls.ok.should.be.true)

  it('should return the expected default video ladder spec when called without any arguments',
    () => R.equals(ls.result, DEFAULT_VIDEO_LADDER_SPEC).should.be.true)



})

const chai = require('chai')
chai.should()

// noinspection JSCheckFunctionSignatures
chai.use(require('chai-things'))
// const expect = chai.expect

const R = require('ramda')

const ABR = require('../src/ElvABRProfile')

const DEFAULT_VIDEO_LADDER = require('./fixtures/video-ladder-spec-default')

describe('VideoLadderSpecs', function () {
  it('should return a valid ladder spec when called without any arguments', function () {
    const ls = ABR.VideoLadderSpecs()
    console.log(JSON.stringify(ls,null,2))
    ls.ok.should.be.true
    R.equals(ls.result, DEFAULT_VIDEO_LADDER).should.be.true
  })
})

const chai = require('chai')
chai.should()

// noinspection JSCheckFunctionSignatures
chai.use(require('chai-things'))
// const expect = chai.expect

const R = require('ramda')

const ABR = require('../src/ElvABRProfile')
const {dump} = require('../src/lib/utils')

const DEFAULT_VIDEO_LADDER_SPEC = require('./fixtures/video-ladder-spec-default')

describe('VideoLadderSpecs', function () {

  const ls = ABR.VideoLadderSpecs()

  if (!ls.ok) {
    dump(ls)
  }

  it('should return a valid ladder spec when called without any arguments',
    () => ls.ok.should.be.true)

  it('should return the expected default video ladder spec when called without any arguments',
    () => R.equals(ls.result, DEFAULT_VIDEO_LADDER_SPEC).should.be.true)


})

describe('ABRProfileForVariant', function () {
  it('should return a valid ABR profile when called with valid production master info',
    () => {
      const pmSources = {
        'test.mp4': {
          'container_format': {
            'duration': 242.875,
            'filename': 'test.mp4',
            'format_name': 'mov,mp4,m4a,3gp,3g2,mj2',
            'start_time': 0
          },
          'streams': [
            {
              'bit_rate': 2801771,
              'codec_name': 'h264',
              'display_aspect_ratio': '16/9',
              'duration': 242.875,
              'duration_ts': 2984448,
              'field_order': '',
              'frame_count': 5829,
              'frame_rate': '24',
              'hdr': null,
              'height': 1080,
              'language': '',
              'max_bit_rate': 0,
              'sample_aspect_ratio': '1',
              'start_pts': 0,
              'start_time': 0,
              'time_base': '1/12288',
              'type': 'StreamVideo',
              'width': 1920
            },
            {
              'bit_rate': 128013,
              'channel_layout': 'stereo',
              'channels': 2,
              'codec_name': 'aac',
              'duration': 242.83428571428573,
              'duration_ts': 10708992,
              'frame_count': 10458,
              'language': '',
              'max_bit_rate': 0,
              'sample_rate': 44100,
              'start_pts': 0,
              'start_time': 0,
              'time_base': '1/44100',
              'type': 'StreamAudio'
            }
          ]
        }
      }
      const pmVariant = {
        'log': {
          'Level': 3,
          'entries': [
            {
              'l': 4,
              'm': 'avtest.initProdMaster()',
              't': 1646200801731466000
            },
            {
              'l': 3,
              'm': 'Get list of files from object',
              't': 1646200801731466800
            }
          ]
        },
        'streams': {
          'audio': {
            'default_for_media_type': false,
            'label': '',
            'language': '',
            'mapping_info': '',
            'sources': [
              {
                'files_api_path': 'test.mp4',
                'stream_index': 1
              }
            ]
          },
          'video': {
            'default_for_media_type': false,
            'label': '',
            'language': '',
            'mapping_info': '',
            'sources': [
              {
                'files_api_path': 'test.mp4',
                'stream_index': 0
              }
            ]
          }
        }
      }
      const abrProfile = ABR.ABRProfileForVariant(pmSources, pmVariant)

      if (!abrProfile.ok) dump(abrProfile)
      dump(abrProfile)

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
      const pmSources = {
        'test.mp4': {
          'container_format': {
            'duration': 242.875,
            'filename': 'test.mp4',
            'format_name': 'mov,mp4,m4a,3gp,3g2,mj2',
            'start_time': 0
          },
          'streams': [
            {
              'bit_rate': 2801771,
              'codec_name': 'h264',
              'display_aspect_ratio': '16/9',
              'duration': 242.875,
              'duration_ts': 2984448,
              'field_order': '',
              'frame_count': 5829,
              'frame_rate': '24',
              'hdr': null,
              'height': 1080,
              'language': '',
              'max_bit_rate': 0,
              'sample_aspect_ratio': '1',
              'start_pts': 0,
              'start_time': 0,
              'time_base': '1/12288',
              'type': 'StreamVideo',
              'width': 1920
            },
            {
              'bit_rate': 128013,
              'channel_layout': 'stereo',
              'channels': 2,
              'codec_name': 'aac',
              'duration': 242.83428571428573,
              'duration_ts': 10708992,
              'frame_count': 10458,
              'language': '',
              'max_bit_rate': 0,
              'sample_rate': 44100,
              'start_pts': 0,
              'start_time': 0,
              'time_base': '1/44100',
              'type': 'StreamAudio'
            }
          ]
        }
      }
      const pmVariant = {
        'log': {
          'Level': 3,
          'entries': [
            {
              'l': 4,
              'm': 'avtest.initProdMaster()',
              't': 1646200801731466000
            },
            {
              'l': 3,
              'm': 'Get list of files from object',
              't': 1646200801731466800
            }
          ]
        },
        'streams': {
          'audio': {
            'default_for_media_type': false,
            'label': '',
            'language': '',
            'mapping_info': '',
            'sources': [
              {
                'files_api_path': 'test.mp4',
                'stream_index': 1
              }
            ]
          }
        }
      }
      const abrProfile = ABR.ABRProfileForVariant(pmSources, pmVariant)

      if (!abrProfile.ok) dump(abrProfile)
      dump(abrProfile)

      abrProfile.ok.should.be.true
      const audioStereoRung = abrProfile.result
        .ladder_specs['{"media_type":"audio","channels":2}']
        .rung_specs[0]

      audioStereoRung
        .bit_rate
        .should.equal(256000)
    })
})

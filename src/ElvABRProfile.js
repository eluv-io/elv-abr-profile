// ElvLadderSpecs.js
//
// Utility to generate an ABR Profile object for a given ingest video from a parametric ladder spec and
// a list of standard aspect ratios.
//
// Also provides a default parametric ladder, default list of standard aspect ratios, and an example default set of
// video properties

// --------------------------------------
// external modules
// --------------------------------------

const liftA2 = require('crocks/helpers/liftA2')
const liftA3 = require('crocks/helpers/liftA3')
const {Ok} = require('crocks/Result')
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
// internal functions
// --------------------------------------

const ABR_PROFILE_TEMPLATE = {
  drm_optional: true,
  store_clear: false,
  ladder_specs: {
    '{"media_type":"audio","channels":1}': {
      rung_specs: [
        {
          bit_rate: 192000,
          media_type: 'audio',
          pregenerate: true
        }
      ]
    },
    '{"media_type":"audio","channels":2}': {
      rung_specs: [
        {
          bit_rate: 256000,
          media_type: 'audio',
          pregenerate: true
        }
      ]
    },
    '{"media_type":"audio","channels":6}': {
      rung_specs: [
        {
          bit_rate: 384000,
          media_type: 'audio',
          pregenerate: true
        }
      ]
    }
  },
  playout_formats: {
    'dash-widevine': {
      drm: {
        content_id: '',
        enc_scheme_name: 'cenc',
        license_servers: [],
        type: 'DrmWidevine'
      },
      protocol: {
        min_buffer_length: 2,
        type: 'ProtoDash'
      }
    },
    'hls-aes128': {
      drm: {
        enc_scheme_name: 'aes-128',
        type: 'DrmAes128'
      },
      protocol: {
        type: 'ProtoHls'
      }
    },
    'hls-fairplay': {
      drm: {
        enc_scheme_name: 'cbcs',
        license_servers: [],
        type: 'DrmFairplay'
      },
      protocol: {
        type: 'ProtoHls'
      }
    },
    'hls-sample-aes': {
      drm: {
        enc_scheme_name: 'cbcs',
        type: 'DrmSampleAes'
      },
      protocol: {
        type: 'ProtoHls'
      }
    },
    'dash-clear': {
      drm: null,
      protocol: {
        min_buffer_length: 2,
        type: 'ProtoDash'
      }
    },
    'hls-clear': {
      drm: null,
      protocol: {
        type: 'ProtoHls'
      }
    }
  },
  segment_specs: {
    audio: {
      segs_per_chunk: 15,
      target_dur: 2
    },
    video: {
      segs_per_chunk: 15,
      target_dur: 2
    }
  }
}

const _abrProfileForVariant = (prodMasterSources, prodMasterVariant, abrProfile, standardAspectRatios) => {
  // assemble videoProps from prodMaster info

  // find the (first) video stream
  let videoStreamInfo = null

  for (const streamKey in prodMasterVariant.streams) {
    const firstSource = prodMasterVariant.streams[streamKey].sources[0]
    const filePath = firstSource.files_api_path
    const streamIndex = firstSource.stream_index
    if (prodMasterSources[filePath].streams[streamIndex].type === 'StreamVideo') {
      videoStreamInfo = prodMasterSources[filePath].streams[streamIndex]
      break
    }
  }

  if(videoStreamInfo === null) {
    // return audio-only profile
    return Ok(ABR_PROFILE_TEMPLATE)
  } else {
    const videoProps = {
      avgBitrate: videoStreamInfo.bit_rate,
      duration: videoStreamInfo.duration,
      frameRate: videoStreamInfo.frame_rate,
      height: videoStreamInfo.height,
      sampleAspectRatio: videoStreamInfo.sample_aspect_ratio,
      width: videoStreamInfo.width
    }

    const parametricLadder = abrProfile.video_parametric_ladder || PL.DEFAULT

    const vidLadderSpecs = _videoLadderSpecs(videoProps, parametricLadder, standardAspectRatios)

    return vidLadderSpecs.map(_mergeVidLSIntoProfile(abrProfile))
  }

}

const _mergeVidLSIntoProfile = R.curry(
  (abrProfile, vidLadderSpecs) => R.omit(
    ['video_parametric_ladder'],
    R.mergeDeepRight(
      abrProfile,
      {ladder_specs: vidLadderSpecs}
    )
  )
)

const _resultToPOJO = result => result.either(
  errVal => Object({ok: false, errors: R.uniq(R.flatten(errVal.map(R.prop('message')).map(R.split('\n'))))}),
  okVal => Object({ok: true, result: okVal})
)

const _videoLadderSpecs = (videoProps, parametricLadder, standardAspectRatios) => {
  const checkedVideoProps = M.validator(VPM.VideoPropsModel)(videoProps)
  const checkedParametricLadder = M.validator(PLM.ParametricLadderModel)(parametricLadder)
  const checkedStandardAspectRatios = M.validator(ARLM.LandscapeAspectRatioListModel)(standardAspectRatios)

  return liftA2(
    LS.fromParametricLadder,
    checkedVideoProps,
    liftA3(
      PL.computeValues,
      checkedStandardAspectRatios,
      checkedParametricLadder,
      checkedVideoProps
    )
  ).chain(M.validator(LSM.LadderSpecsModel))
}

// --------------------------------------
// exported functions
// --------------------------------------

const ABRProfileForVariant = (prodMasterSources, prodMasterVariant, abrProfile = DEFAULT_PARAMETRIC_ABR_PROFILE, standardAspectRatios = AR.STANDARDS) =>
  _resultToPOJO(
    _abrProfileForVariant(prodMasterSources, prodMasterVariant, abrProfile, standardAspectRatios)
  )


const DEFAULT_PARAMETRIC_ABR_PROFILE = R.mergeDeepRight(
  ABR_PROFILE_TEMPLATE,
  {video_parametric_ladder: PL.DEFAULT}
)

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
const VideoLadderSpecs = (videoProps = V.EXAMPLE, parametricLadder = PL.DEFAULT, standardAspectRatios = AR.STANDARDS) =>
  _resultToPOJO(
    _videoLadderSpecs(videoProps, parametricLadder, standardAspectRatios)
  )

module.exports = {
  ABRProfileForVariant,
  DEFAULT_PARAMETRIC_ABR_PROFILE,
  DEFAULT_PARAMETRIC_LADDER: PL.DEFAULT,
  DEFAULT_STANDARD_ASPECT_RATIOS: AR.STANDARDS,
  DEFAULT_VIDEO_PROPERTIES: V.EXAMPLE,
  VideoLadderSpecs
}

# Eluvio ABR Profile Generator

A library for creating ABR (Adjustable Bitrate) Profiles to use when ingesting media into the Eluvio Content Fabric.

The video bitrate ladder in the generated profile is based on:

* The properties of the video to ingest
* A parametric ladder specification
* A list of standard aspect ratios to (optionally) conform to

## Installation

#### Install from NPM:

```
npm install --save @eluvio/elv-abr-profile
```

## Usage

#### Generate an ABR Profile based on Production Master metadata and default bitrate ladder / standard aspect ratio list

```javascript
const ABR = require('./src/ElvABRProfile');

// Normally obtained from production master object's metadata @ /production_master/sources
// For this example, the master contains a single file 'test.mp4'
const prodMasterSources = {
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
  };

// Normally obtained from production master object's metadata @ /production_master/variants/VARIANT_KEY
// (in the most common case, VARIANT_KEY === 'default')
// prodMasterVariant.log.entries omitted below for brevity
const prodMasterVariant = {
  'log': {
    'Level': 3,
    'entries': []
  },
  'streams': {
    'audio': {
      'default_for_media_type': true,
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
      'default_for_media_type': true,
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

const profile = ABR.ABRProfileForVariant(prodMasterSources, prodMasterVariant);
console.log(JSON.stringify(profile, null, 2))
```

Output:

```json
{
  "ok": true,
  "result": {
    "drm_optional": true,
    "store_clear": false,
    "ladder_specs": {
      "{\"media_type\":\"audio\",\"channels\":1}": {
        "rung_specs": [
          {
            "bit_rate": 192000,
            "media_type": "audio",
            "pregenerate": true
          }
        ]
      },
      "{\"media_type\":\"audio\",\"channels\":2}": {
        "rung_specs": [
          {
            "bit_rate": 256000,
            "media_type": "audio",
            "pregenerate": true
          }
        ]
      },
      "{\"media_type\":\"audio\",\"channels\":6}": {
        "rung_specs": [
          {
            "bit_rate": 384000,
            "media_type": "audio",
            "pregenerate": true
          }
        ]
      },
      "{\"media_type\":\"video\",\"aspect_ratio_height\":9,\"aspect_ratio_width\":16}": {
        "rung_specs": [
          {
            "bit_rate": 12600000,
            "height": 2160,
            "media_type": "video",
            "pregenerate": true,
            "width": 3840
          },
          {
            "bit_rate": 10400000,
            "height": 1440,
            "media_type": "video",
            "pregenerate": false,
            "width": 2560
          },
          {
            "bit_rate": 8550000,
            "height": 1080,
            "media_type": "video",
            "pregenerate": false,
            "width": 1920
          },
          {
            "bit_rate": 4050000,
            "height": 720,
            "media_type": "video",
            "pregenerate": false,
            "width": 1280
          },
          {
            "bit_rate": 1580000,
            "height": 480,
            "media_type": "video",
            "pregenerate": false,
            "width": 854
          },
          {
            "bit_rate": 729000,
            "height": 360,
            "media_type": "video",
            "pregenerate": false,
            "width": 640
          },
          {
            "bit_rate": 450000,
            "height": 240,
            "media_type": "video",
            "pregenerate": false,
            "width": 426
          }
        ]
      }
    },
    "playout_formats": {
      "dash-widevine": {
        "drm": {
          "content_id": "",
          "enc_scheme_name": "cenc",
          "license_servers": [],
          "type": "DrmWidevine"
        },
        "protocol": {
          "min_buffer_length": 2,
          "type": "ProtoDash"
        }
      },
      "hls-aes128": {
        "drm": {
          "enc_scheme_name": "aes-128",
          "type": "DrmAes128"
        },
        "protocol": {
          "type": "ProtoHls"
        }
      },
      "hls-fairplay": {
        "drm": {
          "enc_scheme_name": "cbcs",
          "license_servers": [],
          "type": "DrmFairplay"
        },
        "protocol": {
          "type": "ProtoHls"
        }
      },
      "hls-sample-aes": {
        "drm": {
          "enc_scheme_name": "cbcs",
          "type": "DrmSampleAes"
        },
        "protocol": {
          "type": "ProtoHls"
        }
      },
      "dash-clear": {
        "drm": null,
        "protocol": {
          "min_buffer_length": 2,
          "type": "ProtoDash"
        }
      },
      "hls-clear": {
        "drm": null,
        "protocol": {
          "type": "ProtoHls"
        }
      }
    },
    "segment_specs": {
      "audio": {
        "segs_per_chunk": 15,
        "target_dur": 2
      },
      "video": {
        "segs_per_chunk": 15,
        "target_dur": 2
      }
    }
  }
}
```

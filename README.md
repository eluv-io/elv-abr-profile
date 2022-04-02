# Eluvio ABR Profile Generator

A library for creating ABR (Adjustable Bitrate) Profiles to use when ingesting media into the Eluvio Content Fabric.

The video bitrate ladder in the generated profile is created based on:
* The properties of the video to ingest
* A parametric ladder specification
* A list of standard aspect ratios to (optionally) conform to

## Installation

#### Install from NPM:

```
npm install --save @eluvio/elv-abr-profile
```

## Usage

#### Use defaults for parametric ladder and list of standard aspect ratios

```javascript
const ABR = require('./src/ElvABRProfile');

const videoToIngest = {
  width: 3840,             // Video width in pixels
  height: 2160,            // Video height in pixels
  sampleAspectRatio: "1",  // Sample Aspect Ratio - string containing a whole number or fraction (usually "1", unless video uses non-square pixels)
  frameRate: "30"          // Frame Rate - string containing a whole number or fraction, e.g. "30000/1001"
};

const vls = ABR.VideoLadderSpecs(videoToIngest);
console.log(JSON.stringify(vls, null, 2))
```

Output:

```json
{
  "ok": true,
  "result": {
    "{\"media_type\":\"video\",\"aspect_ratio_height\":9,\"aspect_ratio_width\":16}": {
      "rung_specs": [
        {
          "bit_rate": 14000000,
          "height": 2160,
          "media_type": "video",
          "pregenerate": true,
          "width": 3840
        },
        {
          "bit_rate": 11500000,
          "height": 1440,
          "media_type": "video",
          "pregenerate": false,
          "width": 2560
        },
        {
          "bit_rate": 9500000,
          "height": 1080,
          "media_type": "video",
          "pregenerate": false,
          "width": 1920
        },
        {
          "bit_rate": 4500000,
          "height": 720,
          "media_type": "video",
          "pregenerate": false,
          "width": 1280
        },
        {
          "bit_rate": 1750000,
          "height": 480,
          "media_type": "video",
          "pregenerate": false,
          "width": 854
        },
        {
          "bit_rate": 800000,
          "height": 360,
          "media_type": "video",
          "pregenerate": false,
          "width": 640
        },
        {
          "bit_rate": 500000,
          "height": 240,
          "media_type": "video",
          "pregenerate": false,
          "width": 426
        }
      ]
    }
  }
}
```



that contains
* A base top bitrate, plus the dimensions and frame rate that the bitrate was intended for
* A list of rungs, each with
    * A target dimension (height for landscape videos, width for portrait videos)
    * A bitrate tuning parameter

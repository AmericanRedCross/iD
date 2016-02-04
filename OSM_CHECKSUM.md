# OSM SHA1 Checksum Hash

We are using [rusha.js](https://github.com/srijs/rusha) to create SHA1 checksums of OSM Elements. 
This is [benchmarked](https://dominictarr.github.io/crypto-bench/) to perform well, and it seems 
to work without much trouble.

```js
var r = new Rusha();
r.digest("this is a test");

"fa26be19de6bff93f70bc2308434e4a440bbad02"
```

# Conduit [![Build Status](https://secure.travis-ci.org/bigeasy/conduit.png?branch=master)](http://travis-ci.org/bigeasy/conduit)

Pipeline constructor for Node.js.

# Synopsis

```javascript
var conduit = require('conduit')
  , fs = require('fs')
  , equal = require('assert').equal
  , meow, child;

// Channels are compiled into a function.
meow = conduit('cat < $1 > out.txt');

// The function creates an event emitter.
child = meow(__filename);

// The event emitter tracks the progress of the conduit.
child.on('exit', function () {
  equal(fs.readFileSync('out.txt', 'utf8'), fs.readFileSync(__filename, 'utf8'), 'copied');
  fs.unlinkSync('out.txt');
});
```

## Change Log

Changes for each release.

### Version 0.0.1

Tue Mar  5 08:33:19 UTC 2013

 * Upgrade Proof to 0.0.20.
 * Tidy. #22.
 * Add `.js` suffix to test file names. #23.
 * Delete defunct `parse` function. #21.
 * Emit `close` event from pipeline. #24.
 * Prune outgoing method chaining code. #19.
 * Renamed Channel to Conduit. #17.
 * Implement `grep` as `filter` and `reject`; implement JavaScript functions as
   commands. #14.
 * Update `README.md` for command interpreter. #12.
 * Implement as command interpreter. #13.
 * Implement argument parser #11.
 * Process by line. #9. #7. #3.

### Version 0.0.0

 * Build on Travis CI. #4.
 * Create pipeline. #2.

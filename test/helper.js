/*global describe, it, before, beforeEach, after, afterEach */
'use strict';

var FS = require('q-io/fs');

exports.removeIfExists = function(path) {
  return function(done) {
    FS.exists(path).then(function(exists) {
      if(exists) {
        return FS.remove(path);
      }
    }).done(done);
  };
};
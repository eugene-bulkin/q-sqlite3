/*
 * q-sqlite3
 * https://github.com/eugene-bulkin/q-sqlite3
 *
 * Copyright (c) 2014 Eugene Bulkin
 * Licensed under the MIT license.
 */

'use strict';

var Q = require('q');
var sqlite3 = require('sqlite3').verbose();

exports.createDatabase = function(filename, mode) {
  var deferred = Q.defer();
  try {
    var db = new sqlite3.Database(filename, mode);
    db.on('open', function() {
      deferred.resolve(db);
    });
    db.on('error', function(err) {
      deferred.reject(err);
    });
  } catch(err) {
    deferred.reject(err);
  }
  return deferred.promise;
};

exports.close = function(db) {
  var deferred = Q.defer();
  db.close();
  db.on('close', function() {
    deferred.resolve();
  });
  db.on('error', function(err) {
    deferred.reject(err);
  });
  return deferred.promise;
};

exports.run = function(db, sql) {
  var deferred = Q.defer();
  var args = [sql].concat(Array.prototype.slice.call(arguments, 2));
  var cb = function(error) {
    if(error) {
      deferred.reject(error);
    } else {
      deferred.resolve(this);
    }
  };
  args.push(cb);
  db.run.apply(db, args);
  return deferred.promise;
};

exports.get = function(db, sql) {
  var deferred = Q.defer();
  var args = [sql].concat(Array.prototype.slice.call(arguments, 2));
  var cb = function(error, row) {
    if(error) {
      deferred.reject(error);
    } else {
      deferred.resolve(row);
    }
  };
  args.push(cb);
  db.get.apply(db, args);
  return deferred.promise;
};
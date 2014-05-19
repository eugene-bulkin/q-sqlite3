/*global describe, it, before, beforeEach, after, afterEach */
'use strict';

var QSQL = require('..');
var FS = require('q-io/fs');
var assert = require('assert');
var helper = require('./helper');


describe('Open/Close', function(done) {
  describe('Flat-file databases', function(done) {
    describe('Open and close non-existent database', function(done) {
      var db;
      before(helper.removeIfExists("test/test.db"));
      it('Should open the database.', function() {
        QSQL.createDatabase("test/test.db").then(function(database) {
          db = database;
        }, function(e) {
          assert(false, 'Unexpected error: ' + e);
        }).done(done);
      });
      it('Should close the database', function() {
        db.close().fail(function(e) {
          assert(false, 'Unexpected error: ' + e);
        }).done(done);
      });
      it('Should have created the file', function() {
        FS.exists("test/test.db").then(function(exists) {
          if(!exists) {
            assert(false);
          }
        }, function(e) {
          assert(false, 'Unexpected error: ' + e);
        }).done(done);
      });
      after(helper.removeIfExists("test/test.db"));
    });
    it('Should be unable to open an inaccessible database', function() {
        QSQL.createDatabase("test/no-dir-here/test.db").then(function() {
          assert(false, "Opened database that should be inaccessible");
        }, function(e) {
          if(!e) {
            assert(false, "Opened database that should be inaccessible");
          }
          if(e.errno !== QSQL.CANTOPEN) {
            assert(false, 'Unexpected error: ' + e);
          }
        }).done(done);
    });
    describe('Create a database without a create flag', function(done) {
      before(helper.removeIfExists("test/test.db"));
      it('Should fail to open the database', function(done) {
        QSQL.createDatabase("test/test.db", QSQL.OPEN_READONLY).then(function() {
          assert(false, 'Created database without create flag');
        }, function(e) {
          if(!e) {
            assert(false, 'Created database without create flag');
          }
          if(e.errno !== QSQL.CANTOPEN) {
            assert(false, 'Unexpected error: ' + e);
          }
        }).done(done);
      });
      it('Should not have created the file', function(done) {
        FS.exists("test/test.db").then(function(exists) {
          if(exists) {
            assert(false);
          }
        }, function(e) {
          assert(false, 'Unexpected error: ' + e);
        }).done(done);
      });
      after(helper.removeIfExists("test/test.db"));
    });
  });
  describe('Memory databases', function(done) {
    describe('Open and close memory database', function(done) {
      var db;
      it('Should open the database', function() {
        QSQL.createDatabase(":memory:").then(function(database) {
          db = database;
        }, function(e) {
          assert(false, 'Unexpected error: ' + e);
        }).done(done);
      });
      it('Should close the database', function() {
        db.close().fail(function(e) {
          assert(false, 'Unexpected error: ' + e);
        }).done(done);
      });
      it('Should not close the database twice', function() {
        db.close().then(function() {
          assert(false, 'No error occurred on second close');
        }, function(e) {
          assert(e, 'No error occurred on second close');
          assert(e.errno === QSQL.MISUSE);
        }).done(done);
      });
    });
  });
});
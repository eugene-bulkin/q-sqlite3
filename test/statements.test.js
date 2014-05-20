/* global describe, it, before, beforeEach, after, afterEach */
'use strict';

var QSQL = require('..');
var Q = require('q');
var assert = require('assert');
var helper = require('./helper');

describe('Statements', function() {
  describe('Invalid SQL', function() {
    var db;
    before(function(done) {
      QSQL.createDatabase(':memory:').done(function(database) {
        db = database;
        done();
      });
    });
    var stmt;
    it('Should fail preparing a statement with invalid SQL', function(done) {
        db.prepare('CRATE TALE foo text bar)').then(function() {
          assert(false, "Prepared statement that had invalid SQL");
        }, function(e) {
          assert(e, "Prepared statement that had invalid SQL");
          assert(e.errno === QSQL.ERROR && e.message === 'SQLITE_ERROR: near "CRATE": syntax error', 'Unexpected error: ' + e);
        }).done(done);
    });
    after(function(done) {
      db.close().done(done);
    });
  });
  describe('Simple prepared statement', function() {
    var db;
    before(function(done) {
      QSQL.createDatabase(':memory:').done(function(database) {
        db = database;
        done();
      });
    });
    var stmt;
    it('Should prepare and run the statement', function(done) {
      db.prepare('CREATE TABLE foo (text bar)').then(function(statement) {
        stmt = statement;
      }).then(function() {
        return stmt.run();
      }).fail(function(e) {
        assert(false, 'Unexpected error: ' + e);
      }).done(function() {
        done();
      });
    });
    it('Should be unable to close before finalizing the statement', function(done) {
      db.close().then(function() {
        assert(false, "Closed database before finalizing a statement");
      }, function(e) {
        assert(e, "Closed database before finalizing a statement");
        assert(e.errno === QSQL.BUSY, 'Should have returned a BUSY error.');
      }).done(done);
    });
    it('Should be able to finalize the statement', function(done) {
      stmt.finalize().fail(function(e) {
        assert(false, 'Unexpected error: ' + e);
      }).done(done);
    });
    after(function(done) {
      db.close().done(done);
    });
  });
  before(helper.removeIfExists("test/test2.db"));
  describe('Inserting and retrieving rows', function() {
    var db;
    before(function(done) {
      QSQL.createDatabase('test/test2.db').done(function(database) {
        db = database;
        done();
      });
    });
    var inserted = 0, retrieved = 0, count = 10;
    // inserting a whole bunch of things into an sqlite flat-file table is
    // pretty slow...
    this.timeout(2000 + 100 * count);
    it('Should create the table', function(done) {
      var stmt;
      db.prepare('CREATE TABLE foo (txt TEXT, num INTEGER, flt FLOAT, blb BLOB)').then(function(statement) {
        stmt = statement;
        return stmt.run();
      }).then(function() {
        return stmt.finalize();
      }).fail(function(e) {
        assert(false, 'Unexpected error: ' + e);
      }).done(function() {
        done();
      });
    });
    it('Should insert ' + count + ' rows', function(done) {
      var stmt;
      db.prepare('INSERT INTO foo VALUES(?, ?, ?, ?)').then(function(statement) {
        stmt = statement;
      }).then(function() {
        for(var i = 0; i < count; i++) {
          stmt.run('String ' + i, i, i * Math.PI).then(function(statement) {
            inserted++;
          }).done(function() {
            if(inserted === count) {
              stmt.finalize();
              done();
            }
          });
        }
      });
    });
    it('Should prepare a statement and run it ' + (count + 5) + ' times', function(done) {
      var stmt;
      db.prepare("SELECT txt, num, flt, blb FROM foo ORDER BY num").then(function(statement) {
        assert.equal(statement.sql, 'SELECT txt, num, flt, blb FROM foo ORDER BY num', 'Incorrect query');
        stmt = statement;
      }).then(function() {
        var promises = [];
        for(var i = 0; i < count + 5; i++) {
          promises.push(stmt.get().then((function(i) {
            return function(row) {
              if(retrieved >= count) {
                assert.equal(row, undefined);
              } else {
                assert.equal(row.txt, 'String ' + i);
                assert.equal(row.num, i);
                assert.equal(row.flt, i * Math.PI);
                assert.equal(row.blb, null);
              }

              retrieved++;
            };
          })(i)));
        }
        return Q.all(promises);
      }).fail(function(e) {
        assert(false, 'Unexpected error: ' + e);
      }).done(function() {
        stmt.finalize();
        done();
      });
    });
    it('Should have retrieved ' + (count + 5) + ' rows', function() {
      assert.equal(count + 5, retrieved, "Didn't retrieve all rows");
    });
    after(function(done) {
      db.close().done(done);
    });
  });
  describe('Retrieving reset() function', function() {
    var db;
    before(function(done) {
      QSQL.createDatabase('test/test2.db').done(function(database) {
        db = database;
        done();
      });
    });
    var retrieved = 0, count = 10;
    it('Should retrieve the same row over and over again', function(done) {
      var stmt;
      db.prepare("SELECT txt, num, flt, blb FROM foo ORDER BY num").then(function(statement) {
        stmt = statement;
      }).then(function() {
        var promises = [];
        for(var i = 0; i < count; i++) {
          stmt.reset();
          promises.push(stmt.get().then(function(row) {
            assert.equal(row.txt, 'String 0');
            assert.equal(row.num, 0);
            assert.equal(row.flt, 0.0);
            assert.equal(row.blb, null);

            retrieved++;

            return row;
          }));
        }
        return Q.all(promises);
      }).fail(function(e) {
        assert(false, 'Unexpected error: ' + e);
      }).done(function() {
        stmt.finalize();
        done();
      });
    });
    it('Should have retrieved ' + (count) + ' rows', function() {
      assert.equal(count, retrieved, "Didn't retrieve all rows");
    });
    after(function(done) {
      db.close().done(done);
    });
  });
});
after(helper.removeIfExists("test/test2.db"));
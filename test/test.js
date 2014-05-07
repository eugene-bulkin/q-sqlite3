/*global describe, it, before, beforeEach, after, afterEach */
'use strict';

var Q = require('q');
var FS = require('q-io/fs');
var QSQL = require('../lib/q-sqlite3.js');
var assert = require('assert');

describe('Q-SQLite3', function() {
  before(function(done) {
    Q.all([
      FS.write('test.db', ''),
      FS.write('test2.db', '').then(function() {
        return FS.chmod('test2.db', '0222');
      })
    ]).done(function() {
      done();
    });
  });

  describe('Opening/Closing a database connection', function() {
    var db;
    it('Should open a readable database', function(done) {
      QSQL.createDatabase("test.db").then(function(database) {
        db = database;
        assert(true, 'Database that shouldn\'t error worked on open.');
      }, function(e) {
        assert(false, 'Unexpected error: ' + e);
      }).done(function() {
        done();
      });
    });
    it('Should fail to open a unreadable database', function(done) {
      QSQL.createDatabase("test2.db").then(function() {
        assert(false, 'Database that should error worked on open.');
      }, function(e) {
        assert(true, 'Expected error on opening write-only db: ' + e);
      }).done(function() {
        done();
      });
    });
    it('Should close a database properly', function(done) {
      QSQL.close(db).then(function() {
        assert(true, 'Database successfully closed.');
      }, function(e) {
        assert(false, 'Unexpected error trying to close database: ' + e);
      }).done(function() {
        done();
      });
    });
  });

  describe('Running queries', function() {
    var db;
    before(function(done) {
      QSQL.createDatabase("test.db").done(function(database) {
        db = database;
        done();
      });
    });
    describe('#run()', function() {
      it('Should run a query with no parameters (create table)', function(done) {
        QSQL.run(db, 'CREATE TABLE tbl (id INTEGER PRIMARY KEY, name TEXT, location TEXT)').then(function() {
          assert(true, 'Successfully created table.');
        }, function(e) {
          assert(false, 'Unexpected error trying to run query: ' + e);
        }).done(function() {
          done();
        });
      });
      it('Should run a query with inline parameters (insert)', function(done) {
        QSQL.run(db, 'INSERT INTO tbl (name, location) VALUES(?, ?)', "foo", "bar").then(function(statement) {
          assert.equal(1, statement.lastID, 'Must be first row created in new table.');
        }, function(e) {
          assert(false, 'Unexpected error trying to run query: ' + e);
        }).done(function() {
          done();
        });
      });
      it('Should run a query with array parameters (insert)', function(done) {
        QSQL.run(db, 'INSERT INTO tbl (name, location) VALUES(?, ?)', ["foo2", "bar2"]).then(function(statement) {
          assert.equal(2, statement.lastID, 'Must be second row created in new table.');
        }, function(e) {
          assert(false, 'Unexpected error trying to run query: ' + e);
        }).done(function() {
          done();
        });
      });
      it('Should run a query with object parameters (insert)', function(done) {
        QSQL.run(db, 'INSERT INTO tbl (name, location) VALUES($name, $location)', {
          $name: "foo3",
          $location: "bar3"
        }).then(function(statement) {
          assert.equal(3, statement.lastID, 'Must be third row created in new table.');
        }, function(e) {
          assert(false, 'Unexpected error trying to run query: ' + e);
        }).done(function() {
          done();
        });
      });
    });
    describe('#get()', function() {
      it('Should get just one row', function(done) {
        QSQL.get(db, 'SELECT name, location FROM tbl WHERE name = ?', 'foo').then(function(row) {
          assert.deepEqual({ name: 'foo', location: 'bar' }, row, 'Must return row with name = foo, location = bar');
        }).done(function() {
          done();
        });
      });
      it('Should return undefined when there are no rows', function(done) {
        QSQL.get(db, 'SELECT name, location FROM tbl WHERE name = ?', 'asdf').then(function(row) {
          assert.strictEqual(undefined, row, 'Must return undefined for no rows');
        }).done(function() {
          done();
        });
      });
    });
  });

  after(function(done) {
    Q.all([
      FS.remove('test.db', ''),
      FS.remove('test2.db', '')
    ]).done(function() {
      done();
    });
  });
});

/*
exports.runCmd = {
  setUp: function(done) {
    FS.write('test.db', '').then(function() {
      return QSQL.createDatabase("test.db");
    }).done(function(db) {
      this.db = db;
      done();
    }.bind(this));
  },
  tearDown: function(done) {
    FS.remove('test.db', '').done(function() {
      done();
    });
  },
  'run (no params)': function(test) {
    test.expect(1);
    QSQL.run(this.db, 'CREATE TABLE tbl (id INTEGER PRIMARY KEY, name TEXT, location TEXT)').then(function() {
      assert(true, 'Successfully created table.');
    }, function(e) {
      assert(false, 'Unexpected error trying to run query: ' + e);
    }).done(function() {
      done();
    });
  },
  'run (inline params)': function(test) {
    test.expect(1);
    console.log(2);
    QSQL.run(this.db, 'INSERT INTO tbl (name, location) VALUES(?, ?)', "foo", "bar").then(function(statement) {
      console.log(statement);
    }, function(e) {
      assert(false, 'Unexpected error trying to run query: ' + e);
    }).done(function() {
      done();
    });
  }
};*/
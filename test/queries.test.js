/*global describe, it, before, beforeEach, after, afterEach */
'use strict';

var QSQL = require('..');
var assert = require('assert');
var helper = require('./helper');

describe('Queries', function() {
  var db;
  before(function(done) {
    QSQL.createDatabase(':memory:').done(function(database) {
      db = database;
      done();
    });
  });
  describe("#run()", function() {
    it('Should run a query with no parameters (create table)', function(done) {
      db.run('CREATE TABLE tbl (id INTEGER PRIMARY KEY, name TEXT, location TEXT)').then(function() {
        assert(true, 'Successfully created table.');
      }, function(e) {
        assert(false, 'Unexpected error trying to run query: ' + e);
      }).done(done);
    });
    it('Should run a query with inline parameters (insert)', function(done) {
      db.run('INSERT INTO tbl (name, location) VALUES(?, ?)', "foo", "bar").then(function(statement) {
        assert.equal(1, statement.lastID, 'Must be first row created in new table.');
      }, function(e) {
        assert(false, 'Unexpected error trying to run query: ' + e);
      }).done(done);
    });
    it('Should run a query with array parameters (insert)', function(done) {
      db.run('INSERT INTO tbl (name, location) VALUES(?, ?)', ["foo2", "bar2"]).then(function(statement) {
        assert.equal(2, statement.lastID, 'Must be second row created in new table.');
      }, function(e) {
        assert(false, 'Unexpected error trying to run query: ' + e);
      }).done(done);
    });
    it('Should run a query with object parameters (insert)', function(done) {
      db.run('INSERT INTO tbl (name, location) VALUES($name, $location)', {
        $name: "foo3",
        $location: "bar3"
      }).then(function(statement) {
        assert.equal(3, statement.lastID, 'Must be third row created in new table.');
      }, function(e) {
        assert(false, 'Unexpected error trying to run query: ' + e);
      }).done(done);
    });
  });
  describe('#get()', function() {
    it('Should get just one row', function(done) {
      db.get('SELECT name, location FROM tbl WHERE name = ?', 'foo').then(function(row) {
        assert.deepEqual({ name: 'foo', location: 'bar' }, row, 'Must return row with name = foo, location = bar');
      }).done(done);
    });
    it('Should return undefined when there are no rows', function(done) {
      db.get('SELECT name, location FROM tbl WHERE name = ?', 'asdf').then(function(row) {
        assert.strictEqual(undefined, row, 'Must return undefined for no rows');
      }).done(done);
    });
  });
  describe('#all()', function() {
    it('Should get all rows', function(done) {
      db.all('SELECT name, location FROM tbl WHERE id > 0 ORDER BY id ASC').then(function(rows) {
        assert.equal(3, rows.length, 'Must return 3 rows');
        assert.deepEqual([
          { name: 'foo', location: 'bar' },
          { name: 'foo2', location: 'bar2' },
          { name: 'foo3', location: 'bar3' }
        ], rows, 'Must have correct data');
      }).done(done);
    });
    it('Should return undefined when there are no rows', function(done) {
      db.all('SELECT name, location FROM tbl WHERE id < 0').then(function(rows) {
        assert.deepEqual([], rows, 'Must return empty array for no rows');
      }).done(done);
    });
  });
  describe('#exec()', function() {
    it('Should run queries properly and resolve w/ database', function(done) {
      db.exec('SELECT name, location FROM tbl WHERE id > 0 ORDER BY id ASC').then(function(database) {
        assert.equal(database, db, 'Must resolve w/ database');
      }).done(done);
    });
  });
  after(function(done) {
    db.close().done(done);
  });
});
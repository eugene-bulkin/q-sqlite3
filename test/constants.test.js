/*global describe, it, before, beforeEach, after, afterEach */
'use strict';

var QSQL = require('..');
var assert = require('assert');

describe('Constants', function() {
  it('Should have the right OPEN_* flags', function() {
    assert.ok(QSQL.OPEN_READONLY === 1);
    assert.ok(QSQL.OPEN_READWRITE === 2);
    assert.ok(QSQL.OPEN_CREATE === 4);
  });

  it('Should have the right error flags', function() {
    assert.ok(QSQL.OK === 0);
    assert.ok(QSQL.ERROR === 1);
    assert.ok(QSQL.INTERNAL === 2);
    assert.ok(QSQL.PERM === 3);
    assert.ok(QSQL.ABORT === 4);
    assert.ok(QSQL.BUSY === 5);
    assert.ok(QSQL.LOCKED === 6);
    assert.ok(QSQL.NOMEM === 7);
    assert.ok(QSQL.READONLY === 8);
    assert.ok(QSQL.INTERRUPT === 9);
    assert.ok(QSQL.IOERR === 10);
    assert.ok(QSQL.CORRUPT === 11);
    assert.ok(QSQL.NOTFOUND === 12);
    assert.ok(QSQL.FULL === 13);
    assert.ok(QSQL.CANTOPEN === 14);
    assert.ok(QSQL.PROTOCOL === 15);
    assert.ok(QSQL.EMPTY === 16);
    assert.ok(QSQL.SCHEMA === 17);
    assert.ok(QSQL.TOOBIG === 18);
    assert.ok(QSQL.CONSTRAINT === 19);
    assert.ok(QSQL.MISMATCH === 20);
    assert.ok(QSQL.MISUSE === 21);
    assert.ok(QSQL.NOLFS === 22);
    assert.ok(QSQL.AUTH === 23);
    assert.ok(QSQL.FORMAT === 24);
    assert.ok(QSQL.RANGE === 25);
    assert.ok(QSQL.NOTADB === 26);
  });
});
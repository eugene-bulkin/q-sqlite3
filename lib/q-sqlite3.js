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

// export constants first
var consts = {
  // OPEN_* constants
  "OPEN_READONLY": 1,
  "OPEN_READWRITE": 2,
  "OPEN_CREATE": 4,
  // response constants
  "OK": 0,
  "ERROR": 1,
  "INTERNAL": 2,
  "PERM": 3,
  "ABORT": 4,
  "BUSY": 5,
  "LOCKED": 6,
  "NOMEM": 7,
  "READONLY": 8,
  "INTERRUPT": 9,
  "IOERR": 10,
  "CORRUPT": 11,
  "NOTFOUND": 12,
  "FULL": 13,
  "CANTOPEN": 14,
  "PROTOCOL": 15,
  "EMPTY": 16,
  "SCHEMA": 17,
  "TOOBIG": 18,
  "CONSTRAINT": 19,
  "MISMATCH": 20,
  "MISUSE": 21,
  "NOLFS": 22,
  "AUTH": 23,
  "FORMAT": 24,
  "RANGE": 25,
  "NOTADB": 26
};

for(var key in consts) {
  exports[key] = consts[key];
}

/*
 * A wrapper for the Statement object.
 */
var Statement = function(stmt) {
  this.stmt = stmt;
  this.sql = stmt.sql;
};

Statement.prototype.run = function() {
  var deferred = Q.defer();
  var args = Array.prototype.slice.call(arguments);
  var cb = function(error) {
    if(error) {
      deferred.reject(error);
    } else {
      deferred.resolve(this);
    }
  };
  args.push(cb);
  this.stmt.run.apply(this.stmt, args);
  return deferred.promise;
};

Statement.prototype.get = function(sql) {
  var deferred = Q.defer();
  var args = Array.prototype.slice.call(arguments);
  var cb = function(error, row) {
    if(error) {
      deferred.reject(error);
    } else {
      deferred.resolve(row);
    }
  };
  args.push(cb);
  this.stmt.get.apply(this.stmt, args);
  return deferred.promise;
};

Statement.prototype.finalize = function() {
  var deferred = Q.defer();
  this.stmt.finalize(function(error) {
    if(error) {
      deferred.reject(error);
    } else {
      deferred.resolve();
    }
  });
  return deferred.promise;
};

Statement.prototype.reset = function() {
  var deferred = Q.defer();
  this.stmt.reset(function(error) {
    if(error) {
      // shouldn't happen according to node-sqlite3 api
      deferred.reject(error);
    } else {
      deferred.resolve();
    }
  });
  return deferred.promise;
};

Statement.prototype.bind = function() {
  var deferred = Q.defer();
  var args = Array.prototype.slice.call(arguments);
  var cb = function(error) {
    if(error) {
      deferred.reject(error);
    } else {
      deferred.resolve();
    }
  };
  args.push(cb);
  this.stmt.bind.apply(this.stmt, args);
  return deferred.promise;
};

/*
 * This is a wrapper for the database object. It exposes several methods for you
 * to act as if it were the sqlite3 database, but with promises.
 */
var Database = function(db) {
  this.db = db;
};

Database.prototype.close = function() {
  var deferred = Q.defer();
  this.db.close();
  this.db.on('close', function() {
    this.db = null;
    deferred.resolve();
  });
  this.db.on('error', function(err) {
    deferred.reject(err);
  });
  return deferred.promise;
};

Database.prototype.run = function(sql) {
  var deferred = Q.defer();
  var args = [sql].concat(Array.prototype.slice.call(arguments, 1));
  var cb = function(error) {
    if(error) {
      deferred.reject(error);
    } else {
      deferred.resolve(this);
    }
  };
  args.push(cb);
  this.db.run.apply(this.db, args);
  return deferred.promise;
};

Database.prototype.get = function(sql) {
  var deferred = Q.defer();
  var args = [sql].concat(Array.prototype.slice.call(arguments, 1));
  var cb = function(error, row) {
    if(error) {
      deferred.reject(error);
    } else {
      deferred.resolve(row);
    }
  };
  args.push(cb);
  this.db.get.apply(this.db, args);
  return deferred.promise;
};

Database.prototype.all = function(sql) {
  var deferred = Q.defer();
  var args = [sql].concat(Array.prototype.slice.call(arguments, 1));
  var cb = function(error, rows) {
    if(error) {
      deferred.reject(error);
    } else {
      deferred.resolve(rows);
    }
  };
  args.push(cb);
  this.db.all.apply(this.db, args);
  return deferred.promise;
};

Database.prototype.exec = function(sql) {
  var deferred = Q.defer();
  this.db.exec(sql, function(error) {
    if(error) {
      deferred.reject(error);
    } else {
      deferred.resolve(this);
    }
  }.bind(this));
  return deferred.promise;
};

Database.prototype.prepare = function(sql) {
  var deferred = Q.defer();
  var args = [sql].concat(Array.prototype.slice.call(arguments, 1));
  var stmt;
  var cb = function(error) {
    if(error) {
      deferred.reject(error);
    } else {
      deferred.resolve(new Statement(stmt));
    }
  };
  args.push(cb);
  stmt = this.db.prepare.apply(this.db, args);
  return deferred.promise;
};
exports.createDatabase = function(filename, mode) {
  var deferred = Q.defer();
  try {
    var db = new sqlite3.Database(filename, mode);
    db.on('open', function() {
      deferred.resolve(new Database(db));
    });
    db.on('error', function(err) {
      deferred.reject(err);
    });
  } catch(err) {
    deferred.reject(err);
  }
  return deferred.promise;
};
# q-sqlite3 [![Build Status](https://secure.travis-ci.org/eugene-bulkin/q-sqlite3.png?branch=master)](http://travis-ci.org/eugene-bulkin/q-sqlite3)

The node-sqlite3 module wrapped with Q promises.

## Getting Started
Install the module with: `npm install q-sqlite3`

## Documentation
The API is functionally the same as [node-sqlite3's API](https://github.com/mapbox/node-sqlite3/wiki/API), currently only supporting the following methods:

* `close`
* `get`
* `run`
* `all`

These all run as promises.

The only new method is `createDatabase`, which serves as a promise-wrapped version of the `Database` constructor; if successful, the promise resolves to the database instance. Otherwise the promise is rejected with the error sent as in node-sqlite3.

## Examples

```javascript
var QSQL = require('q-sqlite3');
var DB = null;

QSQL.createDatabase(':memory:').done(function(db) {
  DB = db;
});

QSQL.run(DB, 'INSERT INTO tbl (name) VALUES (?)', "foo").then(function(statement) {
  // do stuff with statement here
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
* **v0.0.1** - Initial release, only supports 3 basic query functions.

## License
Copyright (c) 2014 Eugene Bulkin. Licensed under the MIT license.

# q-sqlite3 [![Build Status](https://secure.travis-ci.org/eugene-bulkin/q-sqlite3.png?branch=master)](http://travis-ci.org/eugene-bulkin/q-sqlite3)

The node-sqlite3 module wrapped with Q promises.

## Getting Started
Install the module with: `npm install q-sqlite3`

## Documentation
The API is functionally the same as [node-sqlite3's API](https://github.com/mapbox/node-sqlite3/wiki/API). The API methods supported can be found [on the wiki](https://github.com/eugene-bulkin/q-sqlite3/wiki).

These all run as promises. If the normal API would not call the callback with
data, then the promise resolves to the database.

The only new method is `createDatabase`, which serves as a promise-wrapped version of the `Database` constructor; if successful, the promise resolves to the database instance. Otherwise the promise is rejected with the error sent as in node-sqlite3.

## Examples

```javascript
var QSQL = require('q-sqlite3');
var DB = null;

QSQL.createDatabase(':memory:').done(function(db) {
  DB = db;
});

DB.run('INSERT INTO tbl (name) VALUES (?)', "foo").then(function(statement) {
  // do stuff with statement here
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
* **v0.0.1** - Initial release, only supports 3 basic query functions.
* **v0.0.2** - Second release, add exec function.
* **v0.1.0** - Restructuring release. Methods are now exposed as they were in sqlite3, as part of a `Database` or `Statement` object.
* **v0.1.1** - Implement the basics of `Statement`s.
* **v0.1.2** - Extend `Statement` methods.

## License
Copyright (c) 2014 Eugene Bulkin. Licensed under the MIT license.

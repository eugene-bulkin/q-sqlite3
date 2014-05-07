# q-sqlite3 [![Build Status](https://secure.travis-ci.org/eugene-bulkin/q-sqlite3.png?branch=master)](http://travis-ci.org/eugene-bulkin/q-sqlite3)

The node-sqlite3 module wrapped with Q promises.

## Getting Started
Install the module with: `npm install q-sqlite3`

```javascript
var QSQL = require('q-sqlite3');
var DB = null;

QSQL.createDatabase(':memory:').done(function(db) {
  DB = db;
});
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2014 Eugene Bulkin. Licensed under the MIT license.

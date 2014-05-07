var sqlite3 = require('sqlite3').verbose();
try {
  var db = new sqlite3.Database("../test2.db");
  db.on('error', function(){ throw new Error('easdf');});
} catch(e) {
  console.log('blah');
}
# Process Manager (development version)

Tested on Windows and Linux

Installation local
```sh
$ npm install comlog-process-manager
```

# Usage
```javascript
var CMP = require('comlog-process-manager');
CMP.lookup({name: 'node', command: 'contains:filename.js'}, function (err, result) {
	console.info(result);
});
```
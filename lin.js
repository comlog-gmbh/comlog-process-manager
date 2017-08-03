var exec = require('child_process').exec,
	Process = require('./process');

function parseTable(data) {
	var result = [];
	if (data) {
		var lines = data.split(/\r\n|\r|\n/),
			pos = 0;

		//console.info('LINES:'+lines.length);

		var row = null, pos = -1, f;
		for(var i=0; i < lines.length; i++) {
			row = new Process();
			var match = lines[i].match(/([^ ]+)\s+([0-9]+)\s+([0-9:-]{5,20})\s+([0-9.]+)\s+([0-9.]+)\s+([0-9]+)\s+([^\s]+)\s+([^\s]+)\s+(.*)/);
			//console.info(match);
			if (match === null) continue;

			row.user = match[1];
			row.pid = match[2];
			row.time = match[3];
			row.cpu = match[4];
			row.memory = match[5];
			row.priority = match[6];
			row.stat = match[7];
			row.name = match[8];
			row.command = match[9];
			result.push(row);
		}
	}

	return result;
}

function LinProcManager() {
	this.lookup = function(opt, cb) {
		if (!cb) {
			cb = opt;
			opt = null;
		}
		if (!opt) opt = {};

		exec('ps --no-headers -exo "uname,pid,etime,%cpu,%mem,pri,stat,fname,command"', function (err, result) {
			//console.info(result);
			var table = parseTable(result), isOk = true;
			//console.info(JSON.stringify(table));
			if (opt) {
				for(var i= table.length -1; i >= 0; i--) {
					isOk = true;
					for(var f in opt) {
						if (opt[f].indexOf('contains:') === 0) {
							if (!table[i][f] || table[i][f].toUpperCase().indexOf(opt[f].substr(9).toUpperCase()) < 0) {
								isOk = false;
								break;
							}
						}
						else {
							if (!table[i][f] || table[i][f].toUpperCase() != opt[f].toUpperCase()) {
								isOk = false;
								break;
							}
						}
					}

					if (!isOk) table.splice(i, 1);
				}
			}
			cb(err, table);
		});
	}
}

module.exports = new LinProcManager();
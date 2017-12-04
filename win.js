var exec = require('child_process').exec,
	Process = require('./process'),
	map = {
		'Name': 'name',
		'CommandLine': 'command',
		'ProcessId': 'pid',
		'ExecutablePath': 'path',
		'VirtualSize': 'memory'
	},
	whereAccept = ['Caption','CommandLine','CreationClassName','CreationDate','CSCreationClassName','CSName','Description','ExecutablePath','ExecutionState','Handle','HandleCount','InstallDate','KernelModeTime','MaximumWorkingSetSize','MinimumWorkingSetSize','Name','OSCreationClassName','OSName','OtherOperationCount','OtherTransferCount','PageFaults','PageFileUsage','ParentProcessId','PeakPageFileUsage','PeakVirtualSize','PeakWorkingSetSize','Priority','PrivatePageCount','ProcessId','QuotaNonPagedPoolUsage','QuotaPagedPoolUsage','QuotaPeakNonPagedPoolUsage','QuotaPeakPagedPoolUsage','ReadOperationCount','ReadTransferCount','SessionId','Status','TerminationDate','ThreadCount','UserModeTime','VirtualSize','WindowsVersion','WorkingSetSize','WriteOperationCount','WriteTransferCount'];

function parseTable(data) {
	var result = [];
	if (data) {
		var lines = data.split(/\r\n|\r|\n/),
			pos = 0;

		var row = null, pos = -1, f;
		for(var i=3; i < lines.length; i++) {
			if ((pos = lines[i].indexOf('=')) < 0) continue;

			if (lines[i].indexOf('Caption=') === 0 && row) {
				for(f in map) if (row[f]) row[map[f]] = row[f];
				result.push(row);
				row = null;
			}

			if (!row) row = new Process();

			row[lines[i].substr(0, pos)] = lines[i].substr(pos+1);
		}

		if (row) {
			for(f in map) if (row[f]) row[map[f]] = row[f];
			result.push(row);
			row = null;
		}
	}

	return result;
}

function WinProcManager() {
	this.lookup = function(opt, cb) {
		if (!cb) {
			cb = opt;
			opt = null;
		}
		if (!opt) opt = {};
		var filter = [], i, field;
		for(i in opt) {
			field = i;
			// Filter mapping
			for(var j in map) if (i == map[j]) {
				field = j;
				break;
			}

			// Validate filter
			if (whereAccept.indexOf(field) == -1) continue;

			if (typeof opt[i] == 'string' && opt[i].indexOf('contains:') === 0) {
				opt[i] = '%'+opt[i].substr(9)+'%';
			}
			filter.push(field + " LIKE '" + opt[i].replace(/[,]/, '_') + "'");
		}

		var
			where = filter.length > 0 ?  ' WHERE "'+(filter.join(" AND "))+'"' : '',
			query = 'WMIC path win32_process '+where+' get /all /format:list';

		//console.info(query);
		exec(query, function (err, result) {
			cb(err, parseTable(result));
		});
	}
}

module.exports = new WinProcManager();
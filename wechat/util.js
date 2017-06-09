var fs = require('fs');
var xml2js = require('xml2js');

exports.readFileAsync = function(fpath, encoding) {
	return new Promise(function(resolve, reject) {
		fs.readFile(fpath, encoding, function(err, content) {
			if (err) {
				reject(err);
			}else {
				resolve(content);
			}
		});
	});
};

exports.writeFileAsync = function(fpath, content) {
	return new Promise(function(resolve, reject) {
		fs.writeFile(fpath, content, function(err) {
			if (err) {
				reject(err);
			}else {
				resolve();
			}
		});
	});
};

exports.parseXMLAsync = function(xml) {
	return new Promise(function(resolve, reject) {
		xml2js.parseString(xml, {
			trim: true,
			explicitArray: false
		}, function(err, content) {
			if (err) {
				reject(err);
			}
			resolve(content);
		});
	});
};
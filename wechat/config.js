var util = require('./util');
var path = require('path');
var access_token_file = path.join(__dirname, './access_token.txt');

module.exports = {
	wechat: {
		appID: 'wxbd5496ca8ff2f172',
		appSecret: 'c239146ea79caef703bf7d2b1c33fff1',
		token: 'zhangcui',
		getAccessToken: function() {
			return util.readFileAsync(access_token_file);
		},
		saveAccessToken: function(data) {
			var d = JSON.stringify(data);
			return util.writeFileAsync(access_token_file, d);
		}
	}
};
var router = require('koa-router')();
var sha1 = require('sha1');
var config = require('../wechat/config');
var Wechat = require('../wechat/wechat');

router.prefix('/movie');

function createNonce() {
	return Math.random().toString(36).substr(2, 15);
}
function createTimestamp() {
	return parseInt(new Date().getTime() / 1000, 10) + '';
}
function sign(ticket, url) {
	var noncestr = createNonce();
	var timestamp = createTimestamp();
	var params = [
		`noncestr=${noncestr}`,
		`jsapi_ticket=${ticket}`,
		`timestamp=${timestamp}`,
		`url=${url}`
	];
	var str = params.sort().join('&');
	var signature = sha1(str);

	return {
		noncestr,
		timestamp,
		signature
	};
}

router.get('/', function *(next) {
	var wechat = new Wechat(config.wechat);
	var data = yield wechat.fetchTicket();
	var ticket = data.ticket;
	var url = this.href;
	var signs = sign(ticket, url);
	var params = Object.assign(signs, {title: 'movieeeeee'});
	yield this.render('movie', params);
});

module.exports = router;

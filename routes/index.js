var router = require('koa-router')();
var wechat = require('../wechat/index_middleware');
var config = require('../wechat/config');

router.get('/', wechat.get(config.wechat));
router.post('/', wechat.post(config.wechat));

module.exports = router;

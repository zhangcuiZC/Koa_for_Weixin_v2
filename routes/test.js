var router = require('koa-router')();

router.prefix('/test');
router.get('/', function *(next) {
	yield this.render('test');
});

module.exports = router;

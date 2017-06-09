var router = require('koa-router')();

router.prefix('/movie');

router.get('/', function *(next) {
	yield this.render('movie', {title: 'movie'});
});

module.exports = router;

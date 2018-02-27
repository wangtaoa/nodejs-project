var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: '后台登录页面' });
});

router.get('/admin', function(req, res, next) {
  res.render('admin', { title: '后台管理页面' });
});
module.exports = router;

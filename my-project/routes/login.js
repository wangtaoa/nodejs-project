var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var multiparty = require("multiparty");
var DBurl = 'mongodb://localhost';

var theGoodNum = 1;
getNum()
/* GET home page. */
//路由for root
router.get('/', function(req, res, next) {
  res.render('login');
});
//路由for logout
router.get('/logout', function(req, res, next) {
	req.session.username = null;
  res.render('login');
});
//路由for 主页
router.get('/index', function(req, res, next) {
  if(req.session == null || req.session.username == null) {
		res.redirect("/");
	}else{
		res.render('index');
	}
});
//路由for 登录页
router.get('/api/login', function(req, res) {
	var result = {code : -100, message : "用户名或密码错误，请重新输入"};
	var username = req.query.username;
	var pwd = req.query.pwd;
	MongoClient.connect(DBurl, function(err, client) {
		var db = client.db("h1725");
		var collection = db.collection("user");
		collection.find('{"html" : "doudoufei"}').toArray(function(error, cursor){
   		if(cursor[0].username == username && cursor[0].pwd == pwd){
   			result.code = 1;
   			result.message = "登录成功";
   			req.session.username = username;
   			console.log(req.session);
   		}
   		res.json(result);
		});
	})
});
//路由 for 添加商品
router.post("/api/addgood", function(req, res, next) {
	var form = new multiparty.Form({
		uploadDir: "public/images"
	});
	var result = {
		code: 1,
		message: "商品信息保存成功"
	};
	form.parse(req,function(err,body,files){
		var name = body.goods_name[0];
		var price = body.price[0];
		var Artno = body.Artno[0] || "ESC000" + theGoodNum;
		var imgPath = "";
		if(files["img"]){
			imgPath = files["img"][0].path.replace("public\\","");
		}
		var data = [{"name" : name,"price" : price, "imgPath" : imgPath,"goodsnum" : theGoodNum, flag : 1,"Artno" : Artno}];
		MongoClient.connect(DBurl, function(err, client) {
			var db = client.db("h1725");
			var collection = db.collection("goods");
			collection.insert(data,function(err){
				if(err){
					result.code = -1;
					result.message = "提交失败，请重新提交"
				}else{
					theGoodNum ++;
				}
				res.json(result);
			});
		})
	}) 
});
//封装获取当前未使用的最小编号的函数
function getNum(){
	MongoClient.connect(DBurl, function(err, client){
		var db = client.db("h1725");
		var collection = db.collection("goods");
		collection.count(function(err,count){
			theGoodNum = count + 1;
		});
	})
}
module.exports = router;

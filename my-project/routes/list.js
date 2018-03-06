var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var DBurl = 'mongodb://localhost';
var multiparty = require("multiparty");

//路由 : 获取指定条件的商品信息(模糊匹配)
router.post('/api/getgoodslist', function(req, res, next) {
	var pagenum = ~~(req.body.num);
	var condition = {"flag" : 1,"name":{$regex:req.body.condition}};
	var skip = (req.body.skip);
	getGoods(res,condition,pagenum,skip);
});
//路由 : 获取指定条件的商品信息(精确匹配)
router.post('/api/onegood', function(req, res, next) {
	var num = ~~req.body.goodsnum;
	var condition = { "flag" : 1, "goodsnum" : num };
	console.log(condition);
	getGoods(res,condition);
});
//路由 : 删除商品
router.post('/api/remove', function(req, res, next) {
	var result = {code : 1,message : "删除成功"};
	var id = ~~req.body.id;
	console.log(id);
	MongoClient.connect(DBurl, function(err1, client) {
		var db = client.db("h1723");
		var collection = db.collection("goods");
		collection.update({"goodsnum":id},{$set:{"flag":0}},function(err){
			if(err){
				result.code = -1;
				result.message = "删除失败";
				return;
			}
			collection.count({"flag" : 1},function(err,count){
				result.num = count;
				res.json(result);
			})
		})
	})
});
//路由 : 修改商品信息
router.post("/api/changegood", function(req, res, next) {
	var form = new multiparty.Form({
		uploadDir: "public/images"
	});
	var result = {
		code: 1,
		message: "商品信息修改成功"
	};
	form.parse(req,function(err,body,files){
		var name = body.goods_name[0];
		var price = body.price[0];
		var goodsnum = ~~body.goodsnum[0];
		var Artno = body.Artno[0];
		var imgPath = "";
		if(files["img"]){
			imgPath = files["img"][0].path.replace("public\\","");
		}
		var data = {"name" : name,"price" : price, "imgPath" : imgPath,"Artno" : Artno};
		MongoClient.connect(DBurl, function(err, client) {
			var db = client.db("h1723");
			var collection = db.collection("goods");
			collection.update({"goodsnum":goodsnum},{$set:data},function(err){
				if(err){
					result.code = -1;
					result.message = "提交失败，请重新提交"
				}
				res.json(result);
			});
		})
	}) 
});

//封装获取指定条件数据的函数
function getGoods(res,condition,num,skip){
	var num = num || 1;
	var result = { code : 1, message : "获取列表成功",data : [],num : 0};
	MongoClient.connect(DBurl, function(err1, client) {
		var db = client.db("h1723");
		var collection = db.collection("goods");
		collection.find(condition).limit(num).skip((skip - 1) * num).toArray(function(err2,cursor){
			if(err2){
				result.code = -1 ;
				result.message = "获取列表失败";
			}else{
				result.data = cursor;
				collection.count(condition,function(err3,count){
					result.num = count;
					res.json(result);
				})
			}
		})
	})	
}

module.exports = router;

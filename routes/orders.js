var express = require('express');
var redis = require('redis');
var aws = require('aws-sdk');
var config = require('../config/config.' + [process.env.NODE_ENV || 'development']);

aws.config.update({accessKeyId: config.aws.accessKeyId, secretAccessKey: config.aws.secretAccessKey, region: config.aws.region});

var db = new aws.DynamoDB();
var router = express.Router();

router.post('/populate', function(req, res) {
  var order = req.body.order;
  getOrder(order, function(result) {
     res.setHeader('Content-Type', 'application/json');
     res.end(JSON.stringify(result));
  });
});

router.post('/deliverOrder', function(req, res) {
  var id = req.body.order;

  var client = (config.cache.useLocal)
    ? redis.createClient()
    : redis.createClient(config.cache.port, config.cache.host, { no_ready_check: true});

  client.hget('orders', id, function(err, order) {
    client.hdel('orders', id.toString());
    client.publish('del_order', id);
  });

  res.send(id);
});

function getOrder(content, callback) {
  var client = (config.cache.useLocal)
    ? redis.createClient()
    : redis.createClient(config.cache.port, config.cache.host, { no_ready_check: true});

  client.hset('orders', content.id, content, redis.print);
  client.publish('new_order', content, redis.print)

  callback(content);

  /*
  var params = {
    AttributesToGet: [ "Order" ],
    TableName : config.db.tableName,
    Key : { "OrderID" : { "S" : id } }
  };

  db.getItem(params, function(err, data) {

    if (err) {
      callback('');
    }
    else {
      var content = data.Item.Order;
      content.id = id.toString();

      var client = (config.cache.useLocal)
        ? redis.createClient()
        : redis.createClient(config.cache.port, config.cache.host, { no_ready_check: true});

      client.hset('orders', id, content, redis.print);
      client.publish('new_order', content, redis.print)

      callback(content);
    }
  });
  */
}


module.exports = router;

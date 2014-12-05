var express = require('express');
var redis = require('redis');
var aws = require('aws-sdk');
var db = new aws.DynamoDB();
var config = require('../config/config.' + [process.env.NODE_ENV || 'development']);

var router = express.Router();

router.get('/populate', function(req, res) {
  var id = req.body;
  content = getOrder(id);

  var client = (config.cache.useLocal)
    ? redis.createClient()
    : redis.createClient(config.port, config.host, { no_ready_check: true});

  client.hset('orders', id, content);
  client.publish('new_order', content);

  res.send(content);
});

router.post('/deliverOrder', function(req, res) {
  var id = req.body.order;

  var client = (config.cache.useLocal)
    ? redis.createClient()
    : redis.createClient(config.port, config.host, { no_ready_check: true});

  client.hget('orders', id, function(err, order) {
    client.hdel('orders', id.toString());
    client.publish('del_order', order);
  });

  res.send(id);
});

function getOrder(id) {
  var params = {
    AttributesToGet: [ "Order" ],
    TableName : config.db.tableName,
    Key : { "OrderID" : { "S" : id } }
  };

  db.getItem(params, function(err, data) {
    if (err) {
      console.log(err);
      return '';
    }
    else {
      return data;
    }
  });
}

module.exports = router;

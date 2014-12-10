var config = {};

config.db = {
  tableName: 'S3Orders'
};

config.lambda = {
  invokeStep: 'S3RestaurantOrderFulfillmentNotification'
}

module.exports = config;

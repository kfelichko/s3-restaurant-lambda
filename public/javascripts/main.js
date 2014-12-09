var map;
var markers = [];

$(document).ready(function() {
    initializeMap();
    $('#orderList table tbody').on('click', 'td a.linkmarkasready', markOrderAsReady);
    $('#mapCanvas').on('click', '#orderButton', markOrderAsReady);
    $('#btn-add-manual-order').click(addManualOrder);

    var conn = io.connect();
    conn.on('new_order', function(order) {
      displayOrder(order);
    });

    conn.on('del_order', function(order) {
      removeOrder(order);
    });
});

function displayOrder(orderJson) {
  var order = $.parseJSON(orderJson);
  addOrderToMap(order);
  addOrderToTable(order);
}

function addOrderToMap(order) {
  var od = $.parseJSON(order.S);
  var content = '<div class="balloon">' +
                '  <label>Order ID:</label> ' + order.id + '<BR>' +
                '  <label>Contact:</label>' + od.customer.first_name + ' ' + od.customer.last_name  + '<BR>' +
                '  <label>Address:</label>' + od.location + '<BR>' +
                '  <button id="orderButton" rel="' + order.id + '">Deliver Order</button>' +
                '</div>';
  addMarker(order, content);
};

function addOrderToTable(order) {
  var od = $.parseJSON(order.S);
  var row = '<tr id="order' + order.id + '">' +
            '  <td><a href="#" class="linkmarkasready" rel="' + order.id + '" title="Deliver Order">Ready for Delivery</a></td>' +
            '  <td>' + od.customer.first_name + ' ' + od.customer.last_name +  '</td>' +
            '  <td>' + od.location + '</td>' +
            '</tr>';
  $('#orderList table tbody:last').append(row);
}

function removeOrder(orderJson) {
  var order = $.parseJSON(orderJson);
  removeOrderFromMap(order);
  removeOrderFromTable(order);
}

function removeOrderFromMap(order) {
  $.each(markers, function(idx, marker) {
    if (marker.details.toString() == order.id) {
      marker.setMap(null);
      marker = null;
      return;
    }
  });
}

function removeOrderFromTable(order) {
  $('#orderList table tbody #order' + order.id).remove();
}

function markOrderAsReady() {
  var orderId = $(this).attr('rel');
  $.post('/orders/deliverOrder', { order : orderId }).done(function(data) { });
}

function addManualOrder() {
  $('#add-manual-order').modal('show');
}

function initializeMap() {
  map = new GMaps({
    div: '#mapCanvas',
    lat: 39.4139,
    lng: -77.4111,
    zoom: 12
  });
}

function addMarker(order, content) {
  var od = $.parseJSON(order.S);
  GMaps.geocode({
    address: od.location,
    callback: function(results, status) {
      if (status == 'OK') {
        var latlng = results[0].geometry.location;
        map.setCenter(latlng.lat(), latlng.lng());
        var marker = map.createMarker({
          lat: latlng.lat(),
          lng: latlng.lng(),
          details: order.id,
          infoWindow : {
            content : content
          }
        });
        markers.push(marker);
        map.addMarkers([marker]);
      }
    }
  });
}

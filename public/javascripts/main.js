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

function addOrderToMap(od) {
  var content = '<div class="balloon">' +
                '  <label>Order ID:</label> ' + od.id + '<BR>' +
                '  <label>Contact:</label>' + od.customer.first_name + ' ' + od.customer.last_name  + '<BR>' +
                '  <label>Address:</label>' + od.location + '<BR>' +
                '  <button id="orderButton" rel="' + od.id + '">Deliver Order</button>' +
                '</div>';
  addMarker(od, content);
};

function addOrderToTable(od) {
  var row = '<tr id="order' + od.id + '">' +
            '  <td><a href="#" class="linkmarkasready" rel="' + od.id + '" title="Deliver Order">Ready for Delivery</a></td>' +
            '  <td>' + od.customer.first_name + ' ' + od.customer.last_name +  '</td>' +
            '  <td>' + od.location + '</td>' +
            '</tr>';
  $('#orderList table tbody:last').append(row);
}

function removeOrder(orderID) {
  removeOrderFromMap(orderID);
  removeOrderFromTable(orderID);
}

function removeOrderFromMap(orderID) {
  $.each(markers, function(idx, marker) {
    if (marker.details.toString() == orderID) {
      marker.setMap(null);
      marker = null;
      return;
    }
  });
}

function removeOrderFromTable(orderID) {
  $('#orderList table tbody #order' + orderID).remove();
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
    lat: 47.6097,
    lng: -122.3331,
    zoom: 10
  });
}

function addMarker(od, content) {
  //var od = $.parseJSON(order);
  GMaps.geocode({
    address: od.location,
    callback: function(results, status) {
      if (status == 'OK') {
        var latlng = results[0].geometry.location;
        map.setCenter(latlng.lat(), latlng.lng());
        var marker = map.createMarker({
          lat: latlng.lat(),
          lng: latlng.lng(),
          details: od.id,
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

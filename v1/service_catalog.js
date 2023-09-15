$(document).ready(function(){
  var anchor = document.createElement('a');
  var link   = document.createTextNode('Service Catalog');
  anchor.appendChild(link);
  anchor.href = '/hc/p/service_catalog';
  $('#user-nav').prepend(anchor);
});
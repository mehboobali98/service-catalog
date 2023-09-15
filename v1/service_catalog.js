$(document).ready(function(){
  var anchor = document.createElement('a');
  var link   = document.createTextNode('Service Catalog');
  anchor.appendChild(link);
  anchor.href = 'asdasd';
  $('#user-nav').prepend(anchor);
});
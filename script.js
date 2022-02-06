$(document).ready(function(){
  $('.dropdown-menu').hide();

  $(".dropdown-button").on("click", function(){
    $(".dropdown-menu").slideToggle("fast");
  });

  $("#searchInput").on("keyup", function() {
      var value = $(this).val().toLowerCase();
      $("#locationList a").css("display", function() {
         return this.innerText.toLowerCase().indexOf(value) > -1 ? "":"none"
      });
  });

  var getData = function(){
    $.getJSON("https://data.buienradar.nl/2.0/feed/json", function(json) {
      $('.temp-value').html('<h2>HO</h2>')
    });
    return false;
  }

  $("#den-haag").on("click", function(){
    getData();
  })
});
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

  /*var getData = function(area){
    $.getJSON("https://data.buienradar.nl/2.0/feed/json", function(json) {
      //var tmpData = JSON.parse(json);
      console.log("JSON Data: " + json[2].buienradar[0])
    });
    return false;
  }
*/
  $("#den-haag").on("click", function(){
   //getData("Den Haag");
   $.get("https://data.buienradar.nl/2.0/feed/json", function(json) {
     var tempData = (json);
     alert("Data: " + tempData);
   })
    $('.dropdown-menu').hide();
  })

});
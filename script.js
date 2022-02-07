$(document).ready(function() {

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

  $("#search-query").submit(function(event) { 
      performSearch(event); });
});

function performSearch(event) {
  var request;
  event.preventDefault();
  $(".location").text("Searching...");
  $(".temp-value").text();
  $(".temp-desc").text();
  $(".humidity").text();
  $(".wind").text();


  request = $.ajax({
      url: 'https://api.openweathermap.org/data/2.5/weather',
      type: "GET",
      data: { q: $("#searchInput").val(), 
              appid: 'de2d41b23483456da8e390456f8b2f4b',
              units: 'metric'}
  });


  request.done(function (response){
      formatSearchResults(response);
  });
  

  request.fail(function (){
      $(".location").text("N/A");
      $(".temp-desc").text();
      $(".temp-value").text();
      $(".humidity").text();
      $(".wind").text();
    
  });

}

function formatSearchResults(jsonObject) {
  
  var location = jsonObject.name;
  var temp_desc = jsonObject.weather[0].main;
  var temp_value = jsonObject.main.temp;
  var humidity = jsonObject.main.humidity;
  var wind = jsonObject.wind.speed;
  $(".location").text(location);
  $(".temp-desc").text(temp_desc);
  $(".temp-value").text(temp_value);  
  $(".humidity").text(humidity+"%");
  $(".wind").text(wind+" km/h");
}

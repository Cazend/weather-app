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
    performSearch(event, document.getElementById("searchInput").value); });
  
  let loc;

  function performSearch(event, location) {
    let loc = location
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
      data: { q: loc, 
      appid: 'de2d41b23483456da8e390456f8b2f4b',
      units: 'metric'}
    });
    
    
    request.done(function (response){
      formatSearchResults(response);
      console.log(request);
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
    $(".temp-value").html(Math.round(temp_value) + "<img src='icons/thermometer-celsius.svg'></img>"); 
    $(".humidity").text(humidity+"%");
    $(".wind").text(Math.round(wind * 10) / 10 + " km/h")
  }

  var geocoder;
  $("#current").on("click", function(){
    getLocation();
  })

  function getLocation() {
    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    function success(pos) {
        var crd = pos.coords;
        var lat = crd.latitude.toString();
        var lng = crd.longitude.toString();
        var coordinates = [lat, lng];
        getCity(coordinates);
        return;
    }

    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }

    navigator.geolocation.getCurrentPosition(success, error, options);
  }

  function getCity(coordinates) {
    var xhr = new XMLHttpRequest();
    var lat = coordinates[0];
    var lng = coordinates[1];

    xhr.open('GET', "https://us1.locationiq.com/v1/reverse.php?key=pk.2d1c41118353ad56531ae91673854f10&lat=" +
    lat + "&lon=" + lng + "&format=json", true);
    xhr.send();
    xhr.onreadystatechange = processRequest;
    xhr.addEventListener("readystatechange", processRequest, false);

    function processRequest(e) {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);
            var city = response.address.city;
            performSearch(event, city);
            return;
        }
    }
  }
});
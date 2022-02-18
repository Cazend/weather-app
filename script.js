$(document).ready(function() {

  getLocation(); // direct locatie opvragen om te showen

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
    performSearch(event, document.getElementById("searchInput").value);
    getCoordinatesOfCity(document.getElementById("searchInput").value);
  });

  function performSearch(event, location) {
    var request;
    event.preventDefault();
    $(".location").text("Searching...");
    $("#weather-icon-img").attr("src", "icons/loading.svg");
    $(".temp-value").text();
    $(".temp-desc").text();
    $(".humidity").text();
    $(".wind").text();
    
    
    request = $.ajax({
      url: 'https://api.openweathermap.org/data/2.5/weather',
      type: "GET",
      data: { q: location, 
      appid: 'de2d41b23483456da8e390456f8b2f4b',
      units: 'metric'}
    });
    
    request.done(function (response){
      formatSearchResults(response);
      console.log(request);
    });
    
    
    request.fail(function (){
      displayFailSearch();
    });
  }

  function formatSearchResults(jsonObject) {
    
    var location, temp_weather_id, temp_desc, temp_value, humidity, wind;

    location = jsonObject.name;
    temp_weather_id = jsonObject.weather[0].id;
    temp_desc = jsonObject.weather[0].main;
    temp_value = jsonObject.main.temp;
    humidity = jsonObject.main.humidity;
    wind = jsonObject.wind.speed;

    let weather_icon = getWeatherIcon(temp_weather_id, temp_desc);
    console.log("humidity: " + humidity);
    console.log("wind: " + wind);
    $(".location").text(location);
    $("#weather-icon-img").attr("src", weather_icon);
    $(".temp-desc").text(temp_desc);
    $(".temp-value").html(Math.round(temp_value) + "<img src='icons/thermometer-celsius.svg'></img>"); 
    $(".humidity").text(humidity+"%");
    $(".wind").text(Math.round(wind * 10) / 10 + " km/h"); 
  };

  function formatForecastResults(jsonObject) {
    let dayCount = 1;
    jsonObject.daily.forEach((value, index) => {
      if (index > 0) {
        var dayname = new Date(value.dt * 1000).toLocaleDateString("en", {
          weekday: "long",
        });
        var weather_id = value.weather[0].id;
        var weather_desc = value.weather[0].main;
        let icon = getWeatherIcon(weather_id, weather_desc);
        var temp = value.temp.day.toFixed(0);
        $("#fc-d" + dayCount).text(dayname);
        $("#fc-i" + dayCount).attr("src", icon);
        $("#fc-t" + dayCount).html(temp + "<img src='icons/thermometer-celsius.svg'></img>"); 
        dayCount++;
      }
    });
  }

  function getWeatherIcon(id, weather) {
    if(weather != "Atmosphere" && "Clear" && "Clouds") {
      return "icons/" + weather + ".svg";
    } else {
      return "icons/" + id + "-" + weather + ".svg";
    }
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
            performSearch(e, city);
            getForecast(lat, lng);
            return;
        }
    }
  }

  function getForecast(latitude, longtitude) {
    var request;
    /*$(".location").text("Searching...");
    $("#weather-icon-img").attr("src", "icons/loading.svg");
    $(".temp-value").text();
    $(".temp-desc").text();
    $(".humidity").text();
    $(".wind").text();*/

    request = $.ajax({
      url: '//api.openweathermap.org/data/2.5/onecall',
      dataType: 'json',
      type: "GET",
      data: { lat: latitude, lon: longtitude, 
      exclude: 'current,hourly,minutely,alerts',
      appid: 'de2d41b23483456da8e390456f8b2f4b',
      units: 'metric'}
    });
    
    request.done(function (response){
      formatForecastResults(response);
      console.log(request);
    });
  
    request.fail(function (){
      displayFailSearch();
    });
  }

  function getCoordinatesOfCity(city)
  {
    var request;

    request = $.ajax({
      url: 'https://corsanywhere.herokuapp.com/http://api.openweathermap.org/geo/1.0/direct',
      dataType: 'json',
      type: "GET",
      data: { q: city, 
      exclude: 'limit',
      appid: 'de2d41b23483456da8e390456f8b2f4b'}
    });
    
    request.done(function (response){
      var lon, lat;
      lat = response[0].lon;
      lon = response[0].lat;
      getForecast(lat, lon);
    });
  
    request.fail(function (){
      console.log("Failed to retrieve coordinates.");
    });
  }

  function displayFailSearch() {
    $(".location").text("Invalid location");
    $("#weather-icon-img").attr("src", "icons/not-available.svg");
    $(".temp-desc").text("N/A");
    $(".temp-value").html("∞ <img src='icons/thermometer-celsius.svg'></img>"); 
    $(".humidity").text("N/A");
    $(".wind").text("N/A");
    console.log("Failed to retrieve information.");
  }
});
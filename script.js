$(document).ready(function() {

  getLocation(); // direct locatie opvragen om te showen

  $('.dropdown-menu').hide();

  $(".dropdown-button").on("click", function(){
    $(".dropdown-menu").slideToggle("fast");
  });

  $("#search-query").submit(function(event) { 
    performSearch(event, document.getElementById("searchInput").value);
    $(".dropdown-menu").slideToggle("fast");
  });

  var currLon, currLat;

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
    });
    
    request.fail(function (){
      onFailSearch();
      onFailForecast();
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
    currLat = jsonObject.coord.lat;
    currLon = jsonObject.coord.lon;

    let weather_icon = getWeatherIcon(temp_weather_id, temp_desc);

    $(".day").text("Today");
    $(".location").text(location);
    $("#weather-icon-img").attr("src", weather_icon);
    $(".temp-desc").text(temp_desc);
    $(".temp-value").html(Math.round(temp_value) + "<img src='icons/thermometer-celsius.svg'></img>"); 
    $(".humidity").text(humidity+"%");
    $(".wind").text(Math.round(wind * 10) / 10 + " km/h"); 

    fetchForecast();
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

  function formatDayForecast(jsonObject, day) {
    jsonObject.daily.forEach((value, index) => {
      if (index > 0) {
        var dayname = new Date(value.dt * 1000).toLocaleDateString("en", {
          weekday: "long",
        });
        if(dayname == day) {
          var weather_id = value.weather[0].id;
          var weather_desc = value.weather[0].main;
          var temp = value.temp.day.toFixed(0);
          var humidity = value.humidity;
          var wind = value.wind_speed;
          let icon = getWeatherIcon(weather_id, weather_desc);

          $(".day").text(day);
          $("#weather-icon-img").attr("src", icon);
          $(".temp-desc").text(weather_desc);
          $(".temp-value").html(Math.round(temp) + "<img src='icons/thermometer-celsius.svg'></img>"); 
          $(".humidity").text(humidity+"%");
          $(".wind").text(Math.round(wind * 10) / 10 + " km/h"); 
        }
      }
    });
  }

  function getWeatherIcon(id, weather) {
    if(weather != "Atmosphere" && "Clear" && "Clouds") {
      return "icons/" + weather.toLowerCase() + ".svg";
    } else {
      return "icons/" + id + "-" + weather.toLowerCase()+ ".svg";
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

  function getCity(coordinates) { // Source: https://www.geeksforgeeks.org/how-to-get-city-name-by-using-geolocation/
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
            return;
        }
    }
  }

  function fetchForecast(day = "all") {
    if(currLat == null && currLon == null) {
      onFailForecast();
    }
    
    var request = $.ajax({
      url: '//api.openweathermap.org/data/2.5/onecall',
      dataType: 'json',
      type: "GET",
      data: { lat: currLat, lon: currLon, 
      exclude: 'current,hourly,minutely,alerts',
      appid: 'de2d41b23483456da8e390456f8b2f4b',
      units: 'metric'}
    });
    
    request.done(function (response){
      if(day == "all") {
        formatForecastResults(response);
      } else {
        formatDayForecast(response, day);
      }
    });
  
    request.fail(function (){
      onFailForecast();
    });
  }

  $(".fc-weather-icon").on("click", function(){
    var id = $(this).attr('id');
    var day = $('#fc-d' + id.slice(3)).text(); 
    fetchForecast(day);
  });

  function onFailSearch() {
    $(".day").text("N/A");
    $(".location").text("Invalid location");
    $("#weather-icon-img").attr("src", "icons/not-available.svg");
    $(".temp-desc").text("N/A");
    $(".temp-value").html("∞ <img src='icons/thermometer-celsius.svg'></img>"); 
    $(".humidity").text("N/A");
    $(".wind").text("N/A");
    currLat = null;
    currLon = null;
    console.log("Failed to retrieve information.");
  }

  function onFailForecast() {
    let i = 0
    for(i; i <= 7; i++) {
      $("#fc-i" + i).attr("src", "icons/not-available.svg");
      $("#fc-t" + i).html("∞ <img src='icons/thermometer-celsius.svg'></img>"); 
    }
    console.log("Failed to retrieve forecast information.");
  }
});
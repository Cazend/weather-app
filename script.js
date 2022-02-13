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
    performSearch(event, document.getElementById("searchInput").value); });

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
      formatSearchResults(0, response);
      console.log(request);
    });
    
    
    request.fail(function (){
      displayFailSearch();
    });
  }

  function formatSearchResults(type, jsonObject) {
    
    var location, temp_weather_id, temp_desc, temp_value, humidity, wind;
    if(type == 0) {
      location = jsonObject.name;
      temp_weather_id = jsonObject.weather[0].id;
      temp_desc = jsonObject.weather[0].main;
      temp_value = jsonObject.main.temp;
      humidity = jsonObject.main.humidity;
      wind = jsonObject.wind.speed;
    } else {
      var fday = "";
      jsonObject.daily.forEach((value, index) => {
				if (index > 0) {
					var dayname = new Date(value.dt * 1000).toLocaleDateString("en", {
						weekday: "long",
					});
					var icon = value.weather[0].icon;
					var temp = value.temp.day.toFixed(0);
					fday = `<div class="forecast-day">
						<p>${dayname}</p>
						<p><span class="ico-${icon}" title="${icon}"></span></p>
						<div class="forecast-day--temp">${temp}<sup>°C</sup></div>
					</div>`;
					$(".forecast").insertAdjacentHTML('beforeend', fday);
        }
      });
    }

    if(temp_desc != "Atmosphere" && "Clear" && "Clouds") {
      $("#weather-icon-img").attr("src", "icons/" + temp_desc + ".svg");
    } else {
      $("#weather-icon-img").attr("src", "icons/" + temp_desc + "-" + temp_weather_id + ".svg");
    }

    var weather_image = $("#weather-icon-img").attr("src");
/*  var weather_image = $("#weather-icon-img").attr("src"); // werkt niet, betere solution voor niet bestaande images nodig
    if($('#weather-icon-img').width() == 0) {
      $("#weather-icon-img").attr("src", "icons/not-available.svg");
    }*/ 

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
        //getForecast(coordinates);
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
            //getForecast(city);
            return;
        }
    }
  }

  function getForecast(coordinates) {
    var request;
    $(".location").text("Searching...");
    $("#weather-icon-img").attr("src", "icons/loading.svg");
    $(".temp-value").text();
    $(".temp-desc").text();
    $(".humidity").text();
    $(".wind").text();
    
    var la = coordinates[0];
    var lo = coordinates[1];

    request = $.ajax({
      url: '//api.openweathermap.org/data/2.5/onecall',
      dataType: 'json',
      type: "GET",
      data: { lat: la, lon: lo, 
      exclude: 'current,hourly,minutely,alerts',
      appid: 'de2d41b23483456da8e390456f8b2f4b',
      units: 'metric'}
    });
    
    request.done(function (response){
      formatSearchResults(1, response);
      console.log(request);
    });
  
    request.fail(function (){
      displayFailSearch();
    });
  }

  function displayFailSearch() {
    $(".location").text("Invalid location");
    $("#weather-icon-img").attr("src", "icons/not-available.svg");
    $(".temp-desc").text("N/A");
    $(".temp-value").html("∞ <img src='icons/thermometer-celsius.svg'></img>"); 
    $(".humidity").text("N/A");
    $(".wind").text("N/A");
  }
});
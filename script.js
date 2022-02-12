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
  
    var autocomplete;

    function initAutocomplete() {
      // Create the autocomplete object, restricting the search to geographical
      // location types.
      autocomplete = new google.maps.places.Autocomplete(document.getElementById('searchInput')),
          {types: ['geocode']}

      // When the user selects an address from the dropdown, populate the address
      // fields in the form.
      autocomplete.addListener('place_changed', fillInAddress);
    }

    function fillInAddress() {
      // Get the place details from the autocomplete object.
      var place = autocomplete.getPlace();

      for (var component in componentForm) {
        document.getElementById(component).value = '';
        document.getElementById(component).disabled = false;
      }

      // Get each component of the address from the place details
      // and fill the corresponding field on the form.
      for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
        if (componentForm[addressType]) {
          var val = place.address_components[i][componentForm[addressType]];
          document.getElementById(addressType).value = val;
        }
      }
    }

    // Bias the autocomplete object to the user's geographical location,
    // as supplied by the browser's 'navigator.geolocation' object.
    function geolocate() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var geolocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          var circle = new google.maps.Circle({
            center: geolocation,
            radius: position.coords.accuracy
          });
          autocomplete.setBounds(circle.getBounds());
        });
      }
    }
  let loc;

  function performSearch(event, location) {
    let loc = location
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
      data: { q: loc, 
      appid: 'de2d41b23483456da8e390456f8b2f4b',
      units: 'metric'}
    });
    
    
    request.done(function (response){
      formatSearchResults(response);
      console.log(request);
    });
    
    
    request.fail(function (){
      $(".location").text("Invalid location");
      $("#weather-icon-img").attr("src", "icons/not-available.svg");
      $(".temp-desc").text("N/A");
      $(".temp-value").html("∞ <img src='icons/thermometer-celsius.svg'></img>"); 
      $(".humidity").text("N/A");
      $(".wind").text("N/A");
      
    });
    
  }

  function formatSearchResults(jsonObject) {
    
    var location = jsonObject.name;
    var temp_weather_id = jsonObject.weather[0].id;
    var temp_desc = jsonObject.weather[0].main;
    var temp_value = jsonObject.main.temp;
    var humidity = jsonObject.main.humidity;
    var wind = jsonObject.wind.speed;

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
            performSearch(e, city); // tijdelijk, moet nog verbeterd worden
            return;
        }
    }
  }
});
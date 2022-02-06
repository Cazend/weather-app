if (typeof jQuery == 'undefined') {
  console.log('Unable to load jQuery');
} else {
  console.log('jQuery has been loaded.');
}

$('.dropdown-menu').hide();

$(".dropdown-button").on("click", function(){
  $(".dropdown-menu").slideToggle();
});

$(document).ready(function(){
  $("#searchInput").on("keyup", function() {
      var value = $(this).val().toLowerCase();
      $("#locationList p").css("display", function() {
          return this.innerText.toLowerCase().indexOf(value) > -1 ? "":"none"
      });
  });
});
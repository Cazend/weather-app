if (typeof jQuery == 'undefined') {
  console.log('Unable to load jQuery');
} else {
  console.log('jQuery has been loaded.');
}

$('.dropdown-menu').hide();

$(".dropdown-button").on("click", function(){
  $(".dropdown-menu").slideToggle();
});
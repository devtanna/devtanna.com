$(document).ready(function () {
  $('#hero-button').click(function () {
    $('html, body').animate({
      scrollTop: $('#portfolio-section').offset().top
    }, 1500);
  });
    $('#about-me-button').click(function () {
      $('html, body').animate({
        scrollTop: $('#about-me-section').offset().top
      }, 1500);
    });
    $('#contact-button').click(function () {
      $('html, body').animate({
        scrollTop: $('#contact-section').offset().top
      }, 1500);
    });
});
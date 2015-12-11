// JavaScript Document
// HTML5 Ad Template JS from DoubleClick by Google // modified to remove DCS specific code

//Declaring elements from the HTML i.e. Giving them Instance Names like in Flash - makes it easier
var container;
var content;
var bgExit;

// var someElementInHTML;

//Function to run with any animations starting on load, or bringing in images etc
bannerInit = function(){

    //Assign All the elements to the element on the page
    container = document.getElementById('container_ad');
    content = document.getElementById('content_ad');
    bgExit = document.getElementById('background_exit_ad');
    // hd1 = document.getElementById('hd1');
    // hd2 = document.getElementById('hd2');
    // hd3 = document.getElementById('hd3');
    // cta = document.getElementById('cta');

    //show it
    content.style.display = "block";

    //Start the banner
    step1();
}

reset = function() {
  TweenLite.set('.overlay', {css: { autoAlpha: 0 }});
  TweenLite.set('.text', {css: { autoAlpha: 0 }});
  TweenLite.set('.cta', {css: { autoAlpha: 0 }});
  var s = Math.ceil((BANNER_W / IMAGE_W) * 10) / 10;
  TweenLite.set('.image', {css: { opacity: 0, scale: s ,transformOrigin:"left top"}});
};


step1 = function() {
  console.log('animating');
  //tl.play(0);
}

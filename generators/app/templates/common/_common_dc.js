// JavaScript Document
// HTML5 Ad Template JS from DoubleClick by Google

//Declaring elements from the HTML i.e. Giving them Instance Names like in Flash - makes it easier
var container;
var content;
var bgExit;

// var someElementInHTML;

//Function to run with any animations starting on load, or bringing in images etc
// bannerInit is
bannerInit = function(){

    //Assign All the elements to the element on the page
    container = document.getElementById('container_ad');
    content = document.getElementById('content_ad');
    bgExit = document.getElementById('background_exit_ad');
    // someElementInHTML = document.getElementById('some_element_in_html');

    //Setup Background Image (this can be done in CSS as well
    // which it is in the default template.)
    //
    //content.style.backgroundImage = "url("+Enabler.getUrl('background.jpg')+")";

    //Bring in listeners i.e. if a user clicks or rollovers
    addListeners();

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
  console.log('Banner animation has begun.');
  //tl.play(0);
}

//Add Event Listeners for DoubleClick
addListeners = function() {
    bgExit.addEventListener('click', bgExitHandler, false);
}

bgExitHandler = function(e) {
    //Call Exits
    Enabler.exit('HTML5_Background_Clickthrough');
}

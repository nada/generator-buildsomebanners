// JavaScript Document
// HTML5 Ad Template JS from DoubleClick by Google // modified to remove DCS specific code

//Settings
var LOOPS = 3;  //0 == infinite
var loopCnt = 0;

//Declaring elements from the HTML i.e. Giving them Instance Names like in Flash - makes it easier
var container;
var content;
var bgExit;

var tl;

//Function to run with any animations starting on load, or bringing in images etc
bannerInit = function(){

    //Assign All the elements to the element on the page
    container = document.getElementById('container_ad');
    content = document.getElementById('content_ad');
    bgExit = document.getElementById('background_exit_ad');

    reset();

    setUpTimeline();

    //show it
    content.style.display = "block";

    //Start the banner
    step1();
}


reset = function() {
  TweenLite.set('.slide', {css: { autoAlpha: 0 }});
  TweenLite.set('.cta', {css: { autoAlpha: 0 }});
};

setUpTimeline = function() {
  //prepare the time line
  tl = new TimelineLite();
  tl.pause();
  tl.to('.image', 0.5, {css: { autoAlpha: 1 }, ease:Power0.easeNone})
    .to('.slide-1', 1, {css: { autoAlpha: 1 }, ease:Power0.easeNone, delay:0})
    .to('.slide-1', 1, {css: { autoAlpha: 0 }, ease:Power0.easeNone, delay:4})
    .to('.slide-2', 1, {css: { autoAlpha: 1 }, ease:Power0.easeNone, delay:0})
    .to('.cta', 0.5, {css: { autoAlpha: 1}, ease:Power0.easeNone, delay: 2.0}, '-=2.0')
    .to('.slide-2', 1, {css: { autoAlpha: 0 }, ease:Power0.easeNone, delay:2.0})
    .addLabel('tearDown')
    //tear it down
    .to('.cta', 0.5, {css: { autoAlpha: 0}, ease:Power0.easeNone, delay: 0})
    .to('.slide-2', 0.5, {css: { autoAlpha: 0 }, ease:Power0.easeNone, delay: 0.2})
    .to('.image', 0.5, {css: { autoAlpha: 0}, ease:Power0.easeNone, delay: 0.4, onComplete:onTimelineEnd});

  //pause before tear down
  tl.addPause('tearDown', onTearDown);
}

step1 = function() {
  console.log('Banner animation has begun.');
  tl.play(0);
}

onTearDown = function() {
  loopCnt++;
  if(loopCnt < LOOPS) {
    tl.resume();
  }
}

onTimelineEnd = function() {
  reset();
  step1();
}

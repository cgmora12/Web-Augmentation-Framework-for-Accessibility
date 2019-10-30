// ==UserScript==
// @name         Wikipedia Accesible Script
// @updateURL    https://raw.githubusercontent.com/cgmora12/Wikipedia-Accessible/master/WikipediaAccessibleScript.js
// @downloadURL  https://raw.githubusercontent.com/cgmora12/Wikipedia-Accessible/master/WikipediaAccessibleScript.js
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Wikipedia Accesible Script (WAS)
// @author       You
// @match        https://es.wikipedia.org/*
// @match        https://es.m.wikipedia.org/*
// @grant        none
// @require http://code.jquery.com/jquery-3.3.1.slim.min.js
// @require http://code.jquery.com/jquery-3.3.1.min.js
// ==/UserScript==

// Main method

$(document).ready(function() {
    createWebAugmentedMenu();
});


// Main menu
var divMenu;
function createWebAugmentedMenu(){

    divMenu = document.createElement("div");
    divMenu.style = "background-color: white; position: fixed; left: 50%;bottom: 95%;z-index: 100"
    document.body.appendChild(divMenu);

    textToAudio();
    textSize();
    youtubeVideos();
    wikipediaLinks();
}


// Text to Audio

function textToAudio(){
    $('p, ul').each(function() {
        if($(this).parent().attr('role') != 'navigation'){
            var button = document.createElement('button');
            button.innerHTML = "Text to speech";
            button.value = $(this).prop('innerText');
            button.style.fontSize = "18px";
            button.addEventListener('click', function(){
                Read($(this).prop('value'));
            });
            $(this).append(button);
        }
    });

    var cancelfooter = document.createElement('div');
    cancelfooter.id = "cancel";
    var buttonStop = document.createElement('button');
    buttonStop.innerText = "Pause";
    buttonStop.addEventListener('click', stopReading);
    buttonStop.style.height = "50px";
    buttonStop.style.fontSize = "25px";
    cancelfooter.appendChild(buttonStop);
    document.body.appendChild(cancelfooter);
    $('#cancel').css({
        'position': 'fixed',
        'left': '0',
        'bottom': '0',
        'width': '100%',
        'background-color': 'black',
        'color': 'white',
        'text-align': 'center',
        'visibility': 'hidden',
    });
}

var timeoutResumeInfinity;

function Read(message){
    window.speechSynthesis.cancel();
    clearTimeout(timeoutResumeInfinity);
    var reader = new SpeechSynthesisUtterance(message);
    reader.onstart = function(event) {
        resumeInfinity();
    };
    reader.onend = function(event) {
        clearTimeout(timeoutResumeInfinity);
        $('#cancel').css('visibility', 'hidden');
    };
    window.speechSynthesis.speak(reader);
    $('#cancel').css('visibility', 'visible');
}

function resumeInfinity() {
    window.speechSynthesis.pause();
    window.speechSynthesis.resume();
    timeoutResumeInfinity = setTimeout(resumeInfinity, 10000);
    $('#cancel').css('visibility', 'visible');
}

function stopReading(){
    window.speechSynthesis.cancel();
    clearTimeout(timeoutResumeInfinity);
    $('#cancel').css('visibility', 'hidden');
}


// Text size

function textSize(){
    var plusButton = document.createElement("Button");
    plusButton.innerHTML = "Font size +";
    //plusButton.style = "bottom:0;right:0;position:fixed;z-index: 9999"
    divMenu.appendChild(plusButton);
    plusButton.addEventListener('click', function(){
        changeFontSize('+');
    });
    var minusbutton = document.createElement("Button");
    minusbutton.innerHTML = "Font size -";
    //minusbutton.style = "bottom:20px;right:0;position:fixed;z-index: 9999"
    divMenu.appendChild(minusbutton);
    minusbutton.addEventListener('click', function(){
        changeFontSize('-');
    });
}

function changeFontSize(changer){

    var scroll = window.scrollY;
    var totalScroll = Math.max( document.body.scrollHeight, document.body.offsetHeight,
                   document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
    console.log("scroll: " + scroll + " total: " + totalScroll);

    //var bodyContent = document.getElementsByClassName('mw-body-content');
    //document.body.style.fontSize = (window.getComputedStyle(document.body, null).getPropertyValue('font-size') + 1) + 'px';
    var bodyContent = document.getElementsByTagName('div');
    if(changer === '+'){
        for(var i = 0; i < bodyContent.length; i++) {
            var styleI = window.getComputedStyle(bodyContent[i], null).getPropertyValue('font-size');
            var fontSizeI = parseFloat(styleI);
            bodyContent[i].style.fontSize = (fontSizeI + 2) + 'px';
        }
    }
    else if(changer === '-'){
        for(var j = 0; j < bodyContent.length; j++) {
            var styleJ = window.getComputedStyle(bodyContent[j], null).getPropertyValue('font-size');
            var fontSizeJ = parseFloat(styleJ);
            bodyContent[j].style.fontSize = (fontSizeJ - 2) + 'px';
        }
    }

    var currentTotalScroll = Math.max( document.body.scrollHeight, document.body.offsetHeight,
                   document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
    var currentScroll = (scroll * currentTotalScroll) / totalScroll;
    console.log("currentScroll: " + currentScroll + " currentTotalScroll: " + currentTotalScroll);
    window.scrollTo(0, currentScroll);
}

// Youtube videos

function youtubeVideos(){
    getRequest($("#firstHeading").prop('innerText'));
}

function getRequest(searchTerm) {
    var url = 'https://www.googleapis.com/youtube/v3/search';
    var params = {
        part: 'snippet',
        key: 'AIzaSyDeuEVu90ExAcbBW6ycaZAQSHRhAJGd2D0',
        type: 'video',
        maxResults: 6,
        q: searchTerm
    };

    $.getJSON(url, params, showResults);
}

function showResults(results) {
    var html = "";
    var entries = results.items;
    var content = document.createElement('div');

    $.each(entries, function (index, value) {
        var videoId = value.id.videoId;
        var vid = '<iframe width="380" height="200" src="https://www.youtube.com/embed/'+videoId
            +'" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
        content.innerHTML += vid;
    });
    $('.mw-parser-output').append(content)

}


// Wikipedia Links

function wikipediaLinks(){
    //Index
    $('.new').each(function() {
        var word = $(this).prop('href');
        word = word.split("title=")[1];
        word = word.split("&")[0];
        var auxlink = "https://en.wikipedia.org/wiki/"+word;
        $(this).prop('href', auxlink);
    });
}


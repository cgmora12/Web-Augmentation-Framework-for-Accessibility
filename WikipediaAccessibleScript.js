// ==UserScript==
// @name         Wikipedia Accesible Script
// @updateURL    https://raw.githubusercontent.com/cgmora12/Wikipedia-Accessible/master/WikipediaAccessibleScript.js
// @downloadURL  https://raw.githubusercontent.com/cgmora12/Wikipedia-Accessible/master/WikipediaAccessibleScript.js
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Wikipedia Accesible Script (WAS)
// @author       You
// @match        https://es.wikipedia.org/*
// @match        https://es.m.wikipedia.org/*
// @match        https://*.wikipedia.org/*
// @grant        none
// @require http://code.jquery.com/jquery-3.3.1.slim.min.js
// @require http://code.jquery.com/jquery-3.3.1.min.js
// ==/UserScript==


// Global variables
const SpeechRecognition =
  window.webkitSpeechRecognition || window.SpeechRecognition
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList
const recognition = new SpeechRecognition()
var headlines


// Main method
$(document).ready(function() {
    createWebAugmentedMenu();
    addAugmentationOperations();
});


// Main menu
var divMenu;
function createWebAugmentedMenu(){

    var link1 = document.createElement('link');
    link1.rel = 'stylesheet';
    link1.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
    document.head.appendChild(link1)
    var link2 = document.createElement('link');
    link1.rel = 'stylesheet';
    link2.href= 'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css'
    document.head.appendChild(link2)


    divMenu = document.createElement("div");
    divMenu.id = "menu-webaugmentation";
    divMenu.style = "position: absolute; left: 2%; top: 2%; z-index: 100"
    var menuLinkDiv = document.createElement("div");
    var menuLink = document.createElement("a");
    menuLink.href = "javascript:void(0);";
    menuLink.className = "icon";
    menuLink.addEventListener("click", toggleMenu)
    var menuIcon = document.createElement("i");
    menuIcon.className = "fa fa-bars";
    menuLink.appendChild(menuIcon);
    menuLinkDiv.appendChild(menuLink);
    divMenu.appendChild(menuLinkDiv);

    var divButtons = document.createElement('div')
    divButtons.id = "foldingMenu"
    divButtons.style = "padding: 10px; border: 2px solid black; display: none; background-color: white"
    var a1 = document.createElement('a');
    //a1.href = '';
    a1.addEventListener("click", function(){
        changeFontSize('+');
    }, false);
    a1.text = '+ Aa';
    divButtons.appendChild(a1);
    divButtons.appendChild(document.createElement('br'));
    var a2 = document.createElement('a');
    //a2.href = '';
    a2.addEventListener("click", function(){
        changeFontSize('-');
    }, false);
    a2.text = '- Aa';
    divButtons.appendChild(a2);
    divButtons.appendChild(document.createElement('br'));
    var a3 = document.createElement('a');
    //a3.href = '';
    a3.addEventListener("click", goToVideos);
    a3.text = 'Videos';
    divButtons.appendChild(a3);
    var inputVideos = document.createElement('input');
    inputVideos.type = 'checkbox';
    inputVideos.id = 'youtubeVideosInput';
    inputVideos.value = 'youtubeVideosInput';
    inputVideos.checked = true;
    inputVideos.addEventListener("change", toggleYoutubeVideos, false);
    divButtons.appendChild(inputVideos);
    menuLinkDiv.appendChild(divButtons);

    document.body.appendChild(divMenu);
}

function toggleMenu(){
  var x = document.getElementById("foldingMenu");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}


// Operations
function addAugmentationOperations(){
    focusInfo();
    textToAudio();
    audioToText();
    //textSize();
    youtubeVideos();
    wikipediaLinks();
    breadCrumb();
}


// Focus info (delete unnecessary items)
function focusInfo(){
    //Hide instead of remove

    $('#mw-page-base').remove()
    $('#mw-head-base').remove()
    $('#mw-navigation').remove()
    $('#content').removeClass('mw-body')
    $("#content").css({"padding":"1em"})
    $("#siteNotice").remove()
    $(".noprint").remove()
    $("#toc").remove()
    $(".mw-editsection").remove()
    $("#catlinks").remove()
    $(".mw-authority-control").remove()
    $(".authority-control").remove()
    $(".hatnote").remove()
    $(".listaref").remove()
    $(".references").remove()
    var references = document.getElementById("References")
    if(references){references.parentElement.remove()}
    var referencias = document.getElementById("Referencias")
    if(referencias){referencias.parentElement.remove()}
    $("#footer").remove()
    $(".mw-redirectedfrom").remove()
    $(".reference").remove()
    $(".metadata").remove()

    var content = document.getElementById("content");    // Get the <ul> element to insert a new node
    content.insertBefore(document.createElement("br"), content.childNodes[0]);

    // Collapsible items
    /*var link1 = document.createElement('link');
    link1.rel = 'stylesheet';
    link1.href = '/w/load.php?lang=en&modules=ext.cite.styles%7Cmediawiki.hlist%7Cmediawiki.ui.button%2Cicon%7Cmobile.init.styles%7Cskins.minerva.base.styles%7Cskins.minerva.content.styles%7Cskins.minerva.content.styles.images%7Cskins.minerva.icons.images%2Cwikimedia&only=styles&skin=minerva';
    document.head.appendChild(link1)

    headlines = document.getElementsByClassName("mw-headline")

    for(var headlineIndex = 0; headlineIndex < headlines.length; headlineIndex++){
        headlines[headlineIndex].setAttribute("class","section-heading collapsible-heading open-block")
        headlines[headlineIndex].setAttribute("tabindex","0")
        headlines[headlineIndex].setAttribute("aria-haspopup","true")
        headlines[headlineIndex].setAttribute("aria-controls","scontent-collapsible-block-0")
        headlines[headlineIndex].innerHTML = "<div class=\"mw-ui-icon mw-ui-icon-mf-expand mw-ui-icon-element mw-ui-icon-small  indicator mw-ui-icon-flush-left\"></div>" + headlines[headlineIndex].innerHTML
    }*/

}


// Speech recognition
function audioToText(){
    headlines = document.getElementsByClassName("mw-headline")

    var commands = [ 'increase', 'magnify', 'read', 'play', 'font', 'size', 'decrease', 'reduce', 'stop', 'listening'];
    var grammar = '#JSGF V1.0; grammar commands; public <command> = ' + commands.join(' | ') + ' ;';
    var speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1);
    recognition.grammars = speechRecognitionList;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.start();

    recognition.onresult = event => {
        const speechToText = event.results[event.results.length -1][0].transcript;
        console.log(speechToText);
        if(speechToText.includes("increase font size") || speechToText.includes("magnify")){
            changeFontSize('+');
        }
        else if(speechToText.includes("decrease font size") || speechToText.includes("reduce")){
            changeFontSize('-');
        }
        else if(speechToText.includes("read")){
            for(var headlineIndex = 0; headlineIndex < headlines.length; headlineIndex ++){
                if(speechToText.includes("read " + headlines[headlineIndex].textContent.toLowerCase())){
                    var readContent = ""
                    var parent = headlines[headlineIndex].parentElement
                    while(parent.nextElementSibling.tagName != "H2"){
                        parent = parent.nextElementSibling
                        //console.log(parent.innerText)
                        readContent += parent.innerText
                    }
                    Read(readContent);
                    break;
                }
            }
        }
        else if(speechToText.includes("stop listening")){
            recognition.abort();
        }
    }
}


// Text to Audio
function textToAudio(){
    $('p, ul').each(function() {
        if($(this).parent().attr('role') != 'navigation'){
            var button = document.createElement('button');
            button.innerHTML = "&#9658;";
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
    //console.log("Read function: " + message)
    window.speechSynthesis.cancel();
    clearTimeout(timeoutResumeInfinity);
    var reader = new SpeechSynthesisUtterance(message);
    reader.lang = 'en-US';
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


// Font size
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
        key: 'AIzaSyBB9Vs9M1WcozRTjf9rGBU-M-HEpGYGXv8',
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
            +'" frameborder="1" margin="5px" padding="5px" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
        content.innerHTML += vid;
    });

    $('.mw-parser-output').append("<div id='youtubeVideos' style='display: block'><br><h2><span class='mw-headline' id='Youtube_videos'>Youtube videos</span></h2></div>")
    $('#youtubeVideos').append(content)

}

function goToVideos(){
    $(window).scrollTop($('#youtubeVideos').offset().top);
}

function toggleYoutubeVideos(){
  var x = document.getElementById("youtubeVideos");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
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


// Bread Crumb (History)
function breadCrumb(){
    var i
    var breadcrumb = document.createElement('div');
    breadcrumb.id = "breadcrumb";

    if(localStorage.getItem("i") != null){
        i = parseInt(localStorage.getItem("i"))+1;
        localStorage.setItem("i", i);
    }else{
        i = 0;
        localStorage.setItem("i", i);
    }
    localStorage.setItem(i.toString(), location.href);
    localStorage.setItem("name"+i.toString(), document.getElementById("firstHeading").innerText);
    if(i == 6){
        localStorage.setItem("0", localStorage.getItem("1"));
        localStorage.setItem("name0", localStorage.getItem("name1"));
        localStorage.setItem("1", localStorage.getItem("2"));
        localStorage.setItem("name1", localStorage.getItem("name2"));
        localStorage.setItem("2", localStorage.getItem("3"));
        localStorage.setItem("name2", localStorage.getItem("name3"));
        localStorage.setItem("3", localStorage.getItem("4"));
        localStorage.setItem("name3", localStorage.getItem("name4"));
        localStorage.setItem("4", localStorage.getItem("5"));
        localStorage.setItem("name4", localStorage.getItem("name5"));
        localStorage.setItem("5", localStorage.getItem("6"));
        localStorage.setItem("name5", localStorage.getItem("name6"));
        i = 5;
        localStorage.setItem("i", "5");
    }
    document.body.appendChild(breadcrumb);
    $('#breadcrumb').css({
        'position': 'absolute',
        'height': '50px',
        'left': '15%',
        'top': '0',
        'width': '100%',
        'padding': '10px',
        //'background-color': '#FFFFFF',
        'vertical-align': 'bottom',
        'visibility': 'visible',
    });
    var item = ""
    for(var x=0;x<i;x++){
        if(item != localStorage.getItem("name"+x.toString())){
            var link = document.createElement("a");
            link.href = localStorage.getItem(x.toString());
            link.innerText=localStorage.getItem("name"+x.toString());
            link.className="linkBread";
            $('#breadcrumb').append(link);
            document.getElementById("breadcrumb").innerHTML += " > ";
            item = localStorage.getItem("name"+x.toString());
        }
    }
    $('.linkBread').each(function(){
        $(this).css({
            'padding':'3px',
        });
    });
}
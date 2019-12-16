// ==UserScript==
// @name         WAFA
// @updateURL    https://raw.githubusercontent.com/cgmora12/Web-Augmentation-Framework-for-Accessibility/master/WAFA.js
// @downloadURL  https://raw.githubusercontent.com/cgmora12/Web-Augmentation-Framework-for-Accessibility/master/WAFA.js
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  Web Augmentation Framework for Accessibility (WAFA)
// @author       Cesar Gonzalez Mora
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
var languageCodeSyntesis = "en"
var languageCodeCommands = "en"

var listeningActive = false
var readCommand = "read"
var readCommandActive = true
var goToCommand = "go to"
var goToCommandActive = true
var goToVideosCommandActive = true
var increaseFontSizeCommand = "increase font size"
var increaseFontSizeCommandActive = true
var decreaseFontSizeCommand = "decrease font size"
var decreaseFontSizeCommandActive = true
var stopListeningCommand = "stop listening"
var toggleSectionsCommand = "toggle"
var toggleSectionsCommandActive = true

var commands = [increaseFontSizeCommand, decreaseFontSizeCommand, stopListeningCommand, readCommand, goToCommand, toggleSectionsCommand]

var changeCommand = "change command"
var cancelCommand = "cancel"
var changeCommandQuestion = "which command"
var newCommandQuestion = "which is the new command"
var changeCommandInProcess1 = false;
var changeCommandInProcess2 = false;
var newCommandString = "";


// Main method
$(document).ready(function() {
    getAndSetCookies();
    createWebAugmentedMenu();
    addAugmentationOperations();
});

// Cookies management
function getAndSetCookies(){
    if(getCookie("languageCodeSyntesis") !== ""){
        languageCodeSyntesis = getCookie("languageCodeSyntesis")
    } else {
        setCookie("languageCodeSyntesis", languageCodeSyntesis, 10000);
    }

    if(getCookie("languageCodeCommands") !== ""){
        languageCodeCommands = getCookie("languageCodeCommands")
    } else {
        setCookie("languageCodeCommands", languageCodeCommands, 10000);
    }

    if(getCookie("listeningActive") !== ""){
        listeningActive = (getCookie("listeningActive") == 'true')
    } else {
        setCookie("listeningActive", listeningActive, 10000);
    }

    if(getCookie("readCommand") !== ""){
        readCommand = getCookie("readCommand")
    } else {
        setCookie("readCommand", readCommand, 10000);
    }

    if(getCookie("readCommandActive") !== ""){
        readCommandActive = (getCookie("readCommandActive") == 'true')
    } else {
        setCookie("readCommandActive", readCommandActive, 10000);
    }

    if(getCookie("goToCommand") !== ""){
        goToCommand = getCookie("goToCommand")
    } else {
        setCookie("goToCommand", goToCommand, 10000);
    }

    if(getCookie("goToCommandActive") !== ""){
        goToCommandActive = (getCookie("goToCommandActive") == 'true')
    } else {
        setCookie("goToCommandActive", goToCommandActive, 10000);
    }

    if(getCookie("goToVideosCommandActive") !== ""){
        goToVideosCommandActive = (getCookie("goToVideosCommandActive") == 'true')
    } else {
        setCookie("goToVideosCommandActive", goToVideosCommandActive, 10000);
    }

    if(getCookie("increaseFontSizeCommand") !== ""){
        increaseFontSizeCommand = getCookie("increaseFontSizeCommand")
    } else {
        setCookie("increaseFontSizeCommand", increaseFontSizeCommand, 10000);
    }

    if(getCookie("increaseFontSizeCommandActive") !== ""){
        increaseFontSizeCommandActive = (getCookie("increaseFontSizeCommandActive") == 'true')
    } else {
        setCookie("increaseFontSizeCommandActive", increaseFontSizeCommandActive, 10000);
    }

    if(getCookie("decreaseFontSizeCommand") !== ""){
        decreaseFontSizeCommand = getCookie("decreaseFontSizeCommand")
    } else {
        setCookie("decreaseFontSizeCommand", decreaseFontSizeCommand, 10000);
    }

    if(getCookie("decreaseFontSizeCommandActive") !== ""){
        decreaseFontSizeCommandActive = (getCookie("decreaseFontSizeCommandActive") == 'true')
    } else {
        setCookie("decreaseFontSizeCommandActive", decreaseFontSizeCommandActive, 10000);
    }

    if(getCookie("stopListeningCommand") !== ""){
        stopListeningCommand = getCookie("stopListeningCommand")
    } else {
        setCookie("stopListeningCommand", stopListeningCommand, 10000);
    }

    if(getCookie("toggleSectionsCommand") !== ""){
        toggleSectionsCommand = getCookie("toggleSectionsCommand")
    } else {
        setCookie("toggleSectionsCommand", toggleSectionsCommand, 10000);
    }

    if(getCookie("toggleSectionsCommandActive") !== ""){
        toggleSectionsCommandActive = (getCookie("toggleSectionsCommandActive") == 'true')
    } else {
        setCookie("toggleSectionsCommandActive", toggleSectionsCommandActive, 10000);
    }

    commands = [increaseFontSizeCommand, decreaseFontSizeCommand, stopListeningCommand, readCommand, goToCommand, toggleSectionsCommandActive]
}


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

    var toggleListeningIcon = document.createElement("i");
    toggleListeningIcon.id = "toggleListeningIcon";
    toggleListeningIcon.className = "fa fa-circle";

    var a1 = document.createElement('a');
    a1.id = "increaseFontSizeA";
    //a1.href = '';
    a1.addEventListener("click", function(){
        if(increaseFontSizeCommandActive){
            changeFontSize('+');
        }
    }, false);
    a1.text = '+ Aa';
    divButtons.appendChild(a1);
    var inputIncreaseFontSize = document.createElement('input');
    inputIncreaseFontSize.type = 'checkbox';
    inputIncreaseFontSize.id = 'increaseFontSizeInput';
    inputIncreaseFontSize.value = 'increaseFontSizeInput';
    inputIncreaseFontSize.checked = increaseFontSizeCommandActive;
    inputIncreaseFontSize.addEventListener("change", toggleIncreaseFontSize, false);
    divButtons.appendChild(inputIncreaseFontSize);
    divButtons.appendChild(document.createElement('br'));

    var a2 = document.createElement('a');
    a2.id = "decreaseFontSizeA";
    //a2.href = '';
    a2.addEventListener("click", function(){
        if(decreaseFontSizeCommandActive){
            changeFontSize('-');
        }
    }, false);
    a2.text = '- Aa';
    divButtons.appendChild(a2);
    var inputDecreaseFontSize = document.createElement('input');
    inputDecreaseFontSize.type = 'checkbox';
    inputDecreaseFontSize.id = 'decreaseFontSizeInput';
    inputDecreaseFontSize.value = 'decreaseFontSizeInput';
    inputDecreaseFontSize.checked = decreaseFontSizeCommandActive;
    inputDecreaseFontSize.addEventListener("change", toggleDecreaseFontSize, false);
    divButtons.appendChild(inputDecreaseFontSize);
    divButtons.appendChild(document.createElement('br'));

    var aRead = document.createElement('a');
    aRead.id = "readA";
    //a2.href = '';
    aRead.addEventListener("click", function(){
        toggleReadMenu()
    }, false);
    aRead.text = 'Read aloud';
    divButtons.appendChild(aRead);
    var inputRead = document.createElement('input');
    inputRead.type = 'checkbox';
    inputRead.id = 'readInput';
    inputRead.value = 'readInput';
    inputRead.checked = readCommandActive;
    inputRead.addEventListener("change", toggleReadAloud, false);
    divButtons.appendChild(inputRead);
    divButtons.appendChild(document.createElement('br'));

    var aGoTo = document.createElement('a');
    aGoTo.id = "goToA";
    //aGoTo.href = '';
    aGoTo.addEventListener("click", function(){
        toggleGoToMenu()
    }, false);
    aGoTo.text = 'Go to section';
    divButtons.appendChild(aGoTo);
    var inputGoTo = document.createElement('input');
    inputGoTo.type = 'checkbox';
    inputGoTo.id = 'goToInput';
    inputGoTo.value = 'goToInput';
    inputGoTo.checked = goToCommandActive;
    inputGoTo.addEventListener("change", toggleGoTo, false);
    divButtons.appendChild(inputGoTo);
    divButtons.appendChild(document.createElement('br'));

    var a3 = document.createElement('a');
    a3.id = "goToVideosA";
    //a3.href = '';
    a3.addEventListener("click", goToVideos);
    a3.text = 'Videos';
    divButtons.appendChild(a3);
    var inputVideos = document.createElement('input');
    inputVideos.type = 'checkbox';
    inputVideos.id = 'youtubeVideosInput';
    inputVideos.value = 'youtubeVideosInput';
    inputVideos.checked = goToVideosCommandActive;
    inputVideos.addEventListener("change", toggleYoutubeVideos, false);
    divButtons.appendChild(inputVideos);
    divButtons.appendChild(document.createElement('br'));

    var a5 = document.createElement('a');
    a5.id = "voiceCommandsA";
    //a5.href = '';
    a5.addEventListener("click", function(){
        toggleMenu();
        closeLanguageMenu();
        toggleCommandsMenu();
        closeReadMenu();
    }, false);
    a5.text = 'Voice commands';
    divButtons.appendChild(a5);
    var inputVoiceCommands = document.createElement('input');
    inputVoiceCommands.type = 'checkbox';
    inputVoiceCommands.id = 'voiceCommandsInput';
    inputVoiceCommands.value = 'voiceCommandsInput';
    inputVoiceCommands.checked = listeningActive;
    inputVoiceCommands.addEventListener("change", function(){
        if(!this.checked){
            recognition.abort();
            aToggleListening.text = 'Start Listening';
            listeningActive = false;
            toggleListeningIcon.style = "color:red";
        } else{
            recognition.start();
            aToggleListening.text = 'Stop Listening';
            toggleListeningIcon.style = "color:gray";
            listeningActive = true;
        }
        setCookie("listeningActive", listeningActive, 10000);
    }, false);
    divButtons.appendChild(inputVoiceCommands);
    divButtons.appendChild(document.createElement('br'));

    var aToggleSections = document.createElement('a');
    aToggleSections.id = "toggleSectionsA";
    //aToggleSections.href = '';
    aToggleSections.addEventListener("click", function(){
        toggleMenu();
        closeLanguageMenu();
        closeCommandsMenu();
        closeReadMenu();
        toggleToggleSectionsMenu();
    }, false);
    aToggleSections.text = 'Toggle sections';
    divButtons.appendChild(aToggleSections);
    var inputToggleSections = document.createElement('input');
    inputToggleSections.type = 'checkbox';
    inputToggleSections.id = 'toggleSectionsInput';
    inputToggleSections.value = 'toggleSectionsInput';
    inputToggleSections.checked = toggleSectionsCommandActive;
    inputToggleSections.addEventListener("change", function(){
        //TODO
        console.log("Change toggle sections checkbox value");
    }, false);
    divButtons.appendChild(inputToggleSections);
    divButtons.appendChild(document.createElement('br'));

    var a4 = document.createElement('a');
    a4.id = "languageA";
    //a4.href = '';
    a4.addEventListener("click", function(){
        toggleMenu();
        closeCommandsMenu();
        toggleLanguageMenu();
        closeReadMenu();
    }, false);
    a4.text = 'Language';
    divButtons.appendChild(a4);
    divButtons.appendChild(document.createElement('br'));

    var aToggleListening = document.createElement('a');
    aToggleListening.id = "toggleListeningA";
    //aToggleSections.href = '';
    aToggleListening.addEventListener("click", function(){
        closeMenu();
        if(listeningActive){
            recognition.abort();
            aToggleListening.text = 'Start Listening';
            listeningActive = false;
            toggleListeningIcon.style = "color:red";
        } else{
            recognition.start();
            aToggleListening.text = 'Stop Listening';
            listeningActive = true;
            inputVoiceCommands.checked = listeningActive;
            toggleListeningIcon.style = "color:gray";
        }
        setCookie("listeningActive", listeningActive, 10000);
    }, false);
    if(listeningActive){
        aToggleListening.text = 'Stop Listening';
        toggleListeningIcon.style = "color:gray";
    }
    else{
        aToggleListening.text = 'Start Listening';
        toggleListeningIcon.style = "color:red";
    }
    divButtons.appendChild(aToggleListening);
    divButtons.appendChild(toggleListeningIcon);
    divButtons.appendChild(document.createElement('br'));

    var i = document.createElement('i');
    i.className = 'fa fa-close'
    i.style = "position: absolute; right: 10%; top: 20%; z-index: 100;"
    i.addEventListener("click", function(){
        closeMenu();
    }, false);
    divButtons.appendChild(i);

    menuLinkDiv.appendChild(divButtons);
    document.body.appendChild(divMenu);

    changeLanguageMenu();
    commandsMenu();
    createReadMenu();
    createGoToMenu();
}

function toggleMenu(){
  var x = document.getElementById("foldingMenu");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
  closeLanguageMenu();
  closeCommandsMenu();
  closeReadMenu();
  closeGoToMenu();
}
function closeMenu(){
  var x = document.getElementById("foldingMenu");
  x.style.display = "none";
}


function toggleIncreaseFontSize(){
    if(increaseFontSizeCommandActive){
        increaseFontSizeCommandActive = false;
        document.getElementById("increaseFontSizeA").style.setProperty("pointer-events", "none");
    } else {
        increaseFontSizeCommandActive = true;
        document.getElementById("increaseFontSizeA").style.setProperty("pointer-events", "all");
    }
    setCookie("increaseFontSizeCommandActive", increaseFontSizeCommandActive, 10000);
}
function toggleDecreaseFontSize(){
    if(decreaseFontSizeCommandActive){
        decreaseFontSizeCommandActive = false;
        document.getElementById("decreaseFontSizeA").style.setProperty("pointer-events", "none");
    } else {
        decreaseFontSizeCommandActive = true;
        document.getElementById("decreaseFontSizeA").style.setProperty("pointer-events", "all");
    }
    setCookie("decreaseFontSizeCommandActive", decreaseFontSizeCommandActive, 10000);
}

function createReadMenu(){

    var divReadMenu = document.createElement("div")
    divReadMenu.id = "menu-read";
    divReadMenu.style = "position: absolute; left: 5%; top: 5%; z-index: 100; padding: 10px; border: 2px solid black; display: none; background-color: white"

    var i = document.createElement('i');
    i.className = 'fa fa-close'
    i.style = "position: absolute; right: 1%; top: 1%; z-index: 100;"
    i.addEventListener("click", function(){
        closeReadMenu();
    }, false);
    divReadMenu.appendChild(i);

    headlines = document.getElementsByClassName("mw-headline")
    for(var headlineIndex = 0; headlineIndex < headlines.length; headlineIndex ++){
        var a1 = document.createElement('a');
        //a1.href = languages[languagesIndex].firstElementChild.href;
        a1.text = headlines[headlineIndex].textContent
        var headlineElement = headlines[headlineIndex]
        a1.addEventListener("click", readAloudFromHeadlineElement, false);
        a1.headlineElement = headlineElement;
        divReadMenu.appendChild(a1);
        divReadMenu.appendChild(document.createElement('br'));
    }

    document.body.appendChild(divReadMenu);
}
function toggleReadMenu(){
  var x = document.getElementById("menu-read");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
    closeMenu();
  }
}
function closeReadMenu(){
  var x = document.getElementById("menu-read");
  x.style.display = "none";
}
function toggleReadAloud(){
    var divsToHide = document.getElementsByClassName("readAloudButton");
    if(readCommandActive){
        readCommandActive = false;
        document.getElementById("readA").style.setProperty("pointer-events", "none");
        document.getElementsByClassName("readAloudButton")
        for(var i = 0; i < divsToHide.length; i++){
            divsToHide[i].style.display = "none";
        }
    } else {
        readCommandActive = true;
        document.getElementById("readA").style.setProperty("pointer-events", "all");
        for(var i2 = 0; i2 < divsToHide.length; i2++){
            divsToHide[i2].style.display = "block";
        }
    }
    setCookie("readCommandActive", readCommandActive, 10000);
}


function createGoToMenu(){

    var divGoToMenu = document.createElement("div")
    divGoToMenu.id = "menu-goto";
    divGoToMenu.style = "position: absolute; left: 5%; top: 5%; z-index: 100; padding: 10px; border: 2px solid black; display: none; background-color: white"

    var i = document.createElement('i');
    i.className = 'fa fa-close'
    i.style = "position: absolute; right: 1%; top: 1%; z-index: 100;"
    i.addEventListener("click", function(){
        closeGoToMenu();
    }, false);
    divGoToMenu.appendChild(i);

    headlines = document.getElementsByClassName("mw-headline")
    for(var headlineIndex = 0; headlineIndex < headlines.length; headlineIndex ++){
        var a1 = document.createElement('a');
        //a1.href = languages[languagesIndex].firstElementChild.href;
        a1.text = headlines[headlineIndex].textContent
        var headlineElement = headlines[headlineIndex]
        a1.addEventListener("click", goToFromHeadlineElement, false);
        a1.headlineElement = headlineElement;
        divGoToMenu.appendChild(a1);
        divGoToMenu.appendChild(document.createElement('br'));
    }

    document.body.appendChild(divGoToMenu);
}
function toggleGoToMenu(){
  var x = document.getElementById("menu-goto");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
    closeMenu();
  }
}
function closeGoToMenu(){
  var x = document.getElementById("menu-goto");
  x.style.display = "none";
}
function toggleGoTo(){
    if(goToCommandActive){
        goToCommandActive = false;
        document.getElementById("goToA").style.setProperty("pointer-events", "none");
    } else {
        goToCommandActive = true;
        document.getElementById("goToA").style.setProperty("pointer-events", "all");
    }
    setCookie("goToCommandActive", goToCommandActive, 10000);
}

function toggleToggleSectionsMenu(){
    console.log("toggleToggleSectionsMenu");
}

// Language management
function changeLanguageMenu(){

    try {
        var url = window.location.href;
        var urlLanguage = url.split("https://")[1].split(".")[0]
        changePredefinedVoiceLanguage(urlLanguage)
    }
    catch(error) {
        console.error(error);
    }

    var divLanguageMenu = document.createElement("div")
    divLanguageMenu.id = "menu-language";
    divLanguageMenu.style = "position: absolute; left: 5%; top: 5%; z-index: 100; padding: 10px; border: 2px solid black; display: none; background-color: white"

    var i = document.createElement('i');
    i.className = 'fa fa-close'
    i.style = "position: absolute; right: 1%; top: 1%; z-index: 100;"
    i.addEventListener("click", function(){
        closeLanguageMenu();
    }, false);
    divLanguageMenu.appendChild(i);

    var languages = document.getElementsByClassName("interlanguage-link");
    for(var languagesIndex = 0; languagesIndex < languages.length; languagesIndex++){
        if(window.getComputedStyle(languages[languagesIndex]).display === "list-item" &&
          window.getComputedStyle(languages[languagesIndex]).display !== "none"){
            var a1 = document.createElement('a');
            a1.href = languages[languagesIndex].firstElementChild.href;
            a1.text = languages[languagesIndex].firstElementChild.text;
            divLanguageMenu.appendChild(a1);
            divLanguageMenu.appendChild(document.createElement('br'));
            //console.log("language available: " + languages[languagesIndex].firstElementChild.text);
        }
    }
    document.body.appendChild(divLanguageMenu);
}

function changePredefinedVoiceLanguage(urlLanguage){
    languageCodeSyntesis = urlLanguage
    /*switch(urlLanguage){
        case "es": languageCodeSyntesis = "es"
    }*/
}

function toggleLanguageMenu(){
  var x = document.getElementById("menu-language");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}
function closeLanguageMenu(){
  var x = document.getElementById("menu-language");
  x.style.display = "none";
}


// Voice management
function commandsMenu(){
    var divCommandsMenu = document.createElement("div")
    divCommandsMenu.id = "menu-commands";
    divCommandsMenu.style = "position: absolute; left: 5%; top: 5%; z-index: 100; padding: 10px; border: 2px solid black; display: none; background-color: white"

    var i = document.createElement('i');
    i.className = 'fa fa-close'
    i.style = "position: absolute; right: 1%; top: 1%; z-index: 100;"
    i.addEventListener("click", function(){
        closeCommandsMenu();
    }, false);
    divCommandsMenu.appendChild(i);

    var a1 = document.createElement('a');
    a1.text = "'Read' command " + "(" + readCommand + ") ";
    a1.addEventListener("click", function(){
        var result = prompt("New command value for 'read aloud' command", readCommand);
        commands.push(result.toLowerCase());
        commands = commands.filter(function(item) {
            return item !== readCommand
        })
        readCommand = result.toLowerCase();
        setCookie("readCommand", readCommand, 10000);
        console.log(result);
    }, false);
    var a1i = document.createElement('i');
    a1i.className = 'fa fa-edit'
    a1.appendChild(a1i);
    divCommandsMenu.appendChild(a1);
    divCommandsMenu.appendChild(document.createElement('br'));

    var aGoTo = document.createElement('a');
    aGoTo.text = "'Go to' command " + "(" + goToCommand + ") ";
    aGoTo.addEventListener("click", function(){
        var result = prompt("New command value for 'go to section' command", goToCommand);
        commands.push(result.toLowerCase());
        commands = commands.filter(function(item) {
            return item !== goToCommand
        })
        goToCommand = result.toLowerCase();
        setCookie("goToCommand", goToCommand, 10000);
        console.log(result);
    }, false);
    var aGoToi = document.createElement('i');
    aGoToi.className = 'fa fa-edit'
    aGoTo.appendChild(aGoToi);
    divCommandsMenu.appendChild(aGoTo);
    divCommandsMenu.appendChild(document.createElement('br'));

    var a2 = document.createElement('a');
    a2.text = "'Increase font size' command " + "(" + increaseFontSizeCommand + ") ";
    a2.addEventListener("click", function(){
        var result = prompt("New command value for 'increase font size' command", increaseFontSizeCommand);
        commands.push(result.toLowerCase());
        commands = commands.filter(function(item) {
            return item !== increaseFontSizeCommand
        })
        increaseFontSizeCommand = result.toLowerCase();
        setCookie("increaseFontSizeCommand", increaseFontSizeCommand, 10000);
        console.log(result);
    }, false);
    var a2i = document.createElement('i');
    a2i.className = 'fa fa-edit'
    a2.appendChild(a2i);
    divCommandsMenu.appendChild(a2);
    divCommandsMenu.appendChild(document.createElement('br'));

    var a3 = document.createElement('a');
    a3.text = "'Decrease font size' command " + "(" + decreaseFontSizeCommand + ") ";
    a3.addEventListener("click", function(){
        var result = prompt("New command value for 'decrease font size' command", decreaseFontSizeCommand);
        commands.push(result.toLowerCase());
        commands = commands.filter(function(item) {
            return item !== decreaseFontSizeCommand
        })
        decreaseFontSizeCommand = result.toLowerCase();
        setCookie("decreaseFontSizeCommand", decreaseFontSizeCommand, 10000);
        console.log(result);
    }, false);
    var a3i = document.createElement('i');
    a3i.className = 'fa fa-edit'
    a3.appendChild(a3i);
    divCommandsMenu.appendChild(a3);
    divCommandsMenu.appendChild(document.createElement('br'));

    var a4 = document.createElement('a');
    a4.text = "'Stop listening' command " + "(" + stopListeningCommand + ") ";
    a4.addEventListener("click", function(){
        var result = prompt("New command value for 'stop listening' command", stopListeningCommand);
        commands.push(result.toLowerCase());
        commands = commands.filter(function(item) {
            return item !== stopListeningCommand
        })
        stopListeningCommand = result.toLowerCase();
        setCookie("stopListeningCommand", stopListeningCommand, 10000);
        console.log(result);
    }, false);
    var a4i = document.createElement('i');
    a4i.className = 'fa fa-edit'
    a4.appendChild(a4i);
    divCommandsMenu.appendChild(a4);
    divCommandsMenu.appendChild(document.createElement('br'));
    document.body.appendChild(divCommandsMenu);
}

function toggleCommandsMenu(){
  var x = document.getElementById("menu-commands");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}
function closeCommandsMenu(){
  var x = document.getElementById("menu-commands");
  x.style.display = "none";
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

    var content = document.getElementById("content");
    content.insertBefore(document.createElement("br"), content.childNodes[0]);
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
    $(".reflist").remove()
    $(".references").remove()
    var references = document.getElementById("References")
    if(references){references.parentElement.remove()}
    var referencias = document.getElementById("Referencias")
    if(referencias){referencias.parentElement.remove()}
    $("#footer").remove()
    $(".mw-redirectedfrom").remove()
    $(".reference").remove()
    $(".metadata").remove()
    $(".navbox").remove()
    var notes = document.getElementById("Notes")
    if(notes){notes.parentElement.remove()}
    var sources = document.getElementById("Sources")
    if(sources){
        sources = sources.parentElement.nextElementSibling
        while(sources != null && sources.tagName != "H2"){
            var sourcesAux = sources.nexElementSibling
            sources.remove()
            sources = sourcesAux
        }
        document.getElementById("Sources").parentElement.remove()
    }
    var seeAlso = document.getElementById("See_also")
    if(seeAlso){
        seeAlso = seeAlso.parentElement.nextElementSibling
        while(seeAlso != null && seeAlso.tagName != "H2"){
            var seeAlsoAux = seeAlso.nextElementSibling
            seeAlso.remove()
            seeAlso = seeAlsoAux
        }
        document.getElementById("See_also").parentElement.remove()
    }
    var externalLinks = document.getElementById("External_links")
    if(externalLinks){
        externalLinks = externalLinks.parentElement.nextElementSibling
        while(externalLinks != null && externalLinks.tagName != "H2"){
            var externalLinksAux = externalLinks.nextElementSibling
            externalLinks.remove()
            externalLinks = externalLinksAux
        }
        document.getElementById("External_links").parentElement.remove()
    }

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

    var commandsGrammar = [ 'increase', 'magnify', 'read', 'play', 'font', 'size', 'decrease', 'reduce', 'stop', 'listening'];
    var grammar = '#JSGF V1.0; grammar commands; public <command> = ' + commandsGrammar.join(' | ') + ' ;';
    var speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1);
    recognition.grammars = speechRecognitionList;
    recognition.lang = languageCodeCommands;
    recognition.interimResults = false;
    recognition.continuous = true;
    if(listeningActive){
        recognition.start();
    }

    recognition.onresult = event => {
        const speechToText = event.results[event.results.length -1][0].transcript.toLowerCase();
        console.log(speechToText);
        if(!changeCommandInProcess1 && !changeCommandInProcess2){
            if(speechToText.includes(increaseFontSizeCommand) && increaseFontSizeCommandActive){
                changeFontSize('+');
            }
            else if(speechToText.includes(decreaseFontSizeCommand) && decreaseFontSizeCommandActive){
                changeFontSize('-');
            }
            else if(speechToText.includes(readCommand) && readCommandActive){
                for(var headlineIndex = 0; headlineIndex < headlines.length; headlineIndex ++){
                    if(speechToText.includes(readCommand + " " + headlines[headlineIndex].textContent.toLowerCase())){
                        readAloudFromHeadlineElement(headlines[headlineIndex]);
                        /*var readContent = ""
                        var parent = headlines[headlineIndex].parentElement
                        while(parent.nextElementSibling.tagName != "H2"){
                            parent = parent.nextElementSibling
                            //console.log(parent.innerText)
                            readContent += parent.innerText
                        }
                        Read(readContent);*/
                        break;
                    }
                }
            }
            else if(speechToText.includes(goToCommand) && goToCommandActive){
                for(var headlineIndex2 = 0; headlineIndex2 < headlines.length; headlineIndex2 ++){
                    if(speechToText.includes(goToCommand + " " + headlines[headlineIndex2].textContent.toLowerCase())){
                        goToFromHeadlineElement(headlines[headlineIndex2]);
                        /*var readContent = ""
                        var parent = headlines[headlineIndex].parentElement
                        while(parent.nextElementSibling.tagName != "H2"){
                            parent = parent.nextElementSibling
                            //console.log(parent.innerText)
                            readContent += parent.innerText
                        }
                        Read(readContent);*/
                        break;
                    }
                }
            }
            else if(speechToText.includes(changeCommand)){
                console.log("changeCommandInProcess = true")
                changeCommandInProcess1 = true;
                Read(changeCommandQuestion + "?");
            }
            else if(speechToText.includes(stopListeningCommand)){
                recognition.abort();
                listeningActive = false;
                document.getElementById("toggleListeningA").text = "Start Listening";
                document.getElementById("toggleListeningIcon").style = "color:red";
            }
        } else {
            if(changeCommandInProcess1){
                //Command change in process
                if(!speechToText.includes(changeCommandQuestion) && !speechToText.includes(newCommandQuestion)){
                    console.log(commands);
                    if(commands.includes(speechToText.toLowerCase())){
                        Read(newCommandQuestion + "?");
                        newCommandString = speechToText.toLowerCase();
                        changeCommandInProcess1 = false;
                        changeCommandInProcess2 = true;
                    } else if(speechToText.toLowerCase() == cancelCommand) {
                        console.log("Cancel change of command")
                        changeCommandInProcess1 = false;
                        changeCommandInProcess2 = false;
                    } else {
                        Read(speechToText + " is not an existing command. Try again.");
                    }
                }
            } else if(changeCommandInProcess2){
                //Command change in process
                if(!speechToText.includes(changeCommandQuestion) && !speechToText.includes(newCommandQuestion)){
                    if(speechToText.toLowerCase() == cancelCommand) {
                        console.log("Cancel change of command")
                        changeCommandInProcess1 = false;
                        changeCommandInProcess2 = false;
                    } else {
                        Read(speechToText + " is the new command");
                        if(newCommandString === readCommand){
                            readCommand = speechToText.toLowerCase();
                            setCookie("readCommand", readCommand, 10000);
                        } else if(newCommandString === increaseFontSizeCommand){
                            increaseFontSizeCommand = speechToText.toLowerCase();
                            setCookie("increaseFontSizeCommand", increaseFontSizeCommand, 10000);
                        } else if(newCommandString === goToCommand){
                            goToCommand = speechToText.toLowerCase();
                            setCookie("goToCommand", goToCommand, 10000);
                        } else if(newCommandString === stopListeningCommand){
                            stopListeningCommand = speechToText.toLowerCase();
                            setCookie("stopListeningCommand", stopListeningCommand, 10000);
                        } else if(newCommandString === changeCommand){
                            changeCommand = speechToText.toLowerCase();
                            setCookie("changeCommand", changeCommand, 10000);
                        }
                        /*eval(camelize(newCommandString) + "Command = '" + speechToText.toLowerCase() + "'");
                        var variableName = camelize(newCommandString) + "Command";
                        console.log("variableName: " +variableName);*/
                        //console.log("new variable value " + eval(camelize(newCommandString) + "Command"))
                        changeCommandInProcess1 = false;
                        changeCommandInProcess2 = false;
                        commands.push(speechToText.toLowerCase());
                        commands = commands.filter(function(item) {
                            return item !== newCommandString
                        })
                    }
                }
            }
        }
    }
}
function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
}


// Text to Audio
function textToAudio(){
    $('p, ul').each(function() {
        if($(this).parent().attr('role') != 'navigation'){
            var button = document.createElement('button');
            button.innerHTML = "&#9658;";
            button.value = $(this).prop('innerText');
            button.className = "readAloudButton";
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

function readAloudFromHeadlineElement(headlineElement){
    closeReadMenu();

    if(typeof headlineElement.parentElement === 'undefined'){
        headlineElement = headlineElement.currentTarget.headlineElement
    }
    var readContent = ""
    /*var newHeadlines = document.getElementsByClassName("mw-headline")
            for(var newHeadlinesIndex = 0; newHeadlinesIndex < newHeadlines.length; newHeadLinesIndex++){
                if(headlines[headlineIndex].textContent.toLowerCase() === a1.text
            }*/
    var parent = headlineElement.parentElement
    while(parent.nextElementSibling.tagName != "H2"){
        parent = parent.nextElementSibling
        //console.log(parent.innerText)
        readContent += parent.innerText
    }
    Read(readContent);
}

function Read(message){
    //console.log("Read function: " + message)
    window.speechSynthesis.cancel();
    clearTimeout(timeoutResumeInfinity);
    var reader = new SpeechSynthesisUtterance(message);
    reader.lang = languageCodeSyntesis;
    reader.onstart = function(event) {
        recognition.abort();
        resumeInfinity();
    };
    reader.onend = function(event) {
        clearTimeout(timeoutResumeInfinity);
        $('#cancel').css('visibility', 'hidden');
        recognition.start();
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

// Go to

function goToFromHeadlineElement(headlineElement){
    closeGoToMenu();
    closeMenu();

    if(typeof headlineElement.parentElement === 'undefined'){
        headlineElement = headlineElement.currentTarget.headlineElement
    }

    if(goToVideosCommandActive){
        $(window).scrollTop(headlineElement.offsetTop);
    }
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
    if(goToVideosCommandActive){
        toggleMenu();
        $(window).scrollTop($('#youtubeVideos').offset().top);
    }
}

function toggleYoutubeVideos(){
  var x = document.getElementById("youtubeVideos");
  if (x.style.display === "block") {
    x.style.display = "none";
    document.getElementById("goToVideosA").style.setProperty("pointer-events", "none");
    goToVideosCommandActive = false;
  } else {
    x.style.display = "block";
    document.getElementById("goToVideosA").style.setProperty("pointer-events", "all");
    goToVideosCommandActive = true;
  }
  setCookie("goToVideosCommandActive", goToVideosCommandActive, 10000);
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

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}



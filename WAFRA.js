// ==UserScript==
// @name         WAFRA
// @updateURL    https://raw.githubusercontent.com/cgmora12/Web-Augmentation-Framework-for-Accessibility/master/WAFRA.js
// @downloadURL  https://raw.githubusercontent.com/cgmora12/Web-Augmentation-Framework-for-Accessibility/master/WAFRA.js
// @namespace    http://tampermonkey.net/
// @version      0.92
// @description  Web Augmentation Framework for Accessibility (WAFRA)
// @author       Cesar Gonzalez Mora
// @match        *://*/*
// @noframes
// @exclude      *://www.youtube.com/embed/*
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

var listeningActive = true
var readCommand = "read"
var readCommandActive = true
var goToCommand = "go to"
var goToCommandActive = true
var videosCommandActive = true
var increaseFontSizeCommand = "increase font size"
var increaseFontSizeCommandActive = true
var decreaseFontSizeCommand = "decrease font size"
var decreaseFontSizeCommandActive = true
var stopListeningCommand = "stop listening"
var hiddenSectionsCommand = "hidden"
var hiddenSectionsCommandActive = true
var paragraphSectionsCommandActive = true
var breadcrumbCommand = "breadcrumb"
var breadcrumbCommandActive = true
var showOperationsCommand = "show operations"
var showSectionsCommand = "show sections"
var showSectionCommand = "show section"
var welcomeCommand = "welcome"

var commands = [increaseFontSizeCommand, decreaseFontSizeCommand, stopListeningCommand, readCommand, goToCommand,
                hiddenSectionsCommand, breadcrumbCommand, showOperationsCommand, showSectionsCommand, welcomeCommand]

var changeCommand = "change command"
var cancelCommand = "cancel"
var changeCommandQuestion = "which command"
var newCommandQuestion = "which is the new command"
var changeCommandInProcess1 = false;
var changeCommandInProcess2 = false;
var newCommandString = "";
var activateClickDetector = false;
var activateTextDetector = false;

var myStorage = window.localStorage;

var hiddenItems = [];
var hiddenItemsAux = [];
var paragraphItems = [];
var paragraphItemsAux = [];
var textItems = [];
var textItemsAux = [];
var sectionsNames = [];


var annotationsUselessActive = false;
var annotationsTextActive = false;
var annotationsParagraphActive = false;


// Main method
$(document).ready(function() {
    createCSSSelector('.hideSectionsLinks', 'pointer-events: none');
    createCSSSelector('.hideUselessSections', 'display: none');
    createCSSSelector('.hoverColor:hover', 'background-color: grey !important;');
    createCSSSelector('.selectedColor', 'background-color: grey !important;;');
    $('*[class=""]').removeAttr('class');
    getAndSetStorage();
    createWebAugmentedMenu();
    addAugmentationOperations();
});

// Storage management
function getAndSetStorage(){
    if(myStorage.getItem("languageCodeSyntesis") !== null){
        languageCodeSyntesis = myStorage.getItem("languageCodeSyntesis")
    } else {
        myStorage.setItem("languageCodeSyntesis", languageCodeSyntesis);
    }

    if(myStorage.getItem("languageCodeCommands") !== null){
        languageCodeCommands = myStorage.getItem("languageCodeCommands")
    } else {
        myStorage.setItem("languageCodeCommands", languageCodeCommands);
    }

    if(myStorage.getItem("listeningActive") !== null){
        listeningActive = (myStorage.getItem("listeningActive") == 'true')
    } else {
        myStorage.setItem("listeningActive", listeningActive);
    }

    if(myStorage.getItem("readCommand") !== null){
        readCommand = myStorage.getItem("readCommand")
    } else {
        myStorage.setItem("readCommand", readCommand);
    }

    if(myStorage.getItem("readCommandActive") !== null){
        readCommandActive = (myStorage.getItem("readCommandActive") == 'true')
    } else {
        myStorage.setItem("readCommandActive", readCommandActive);
    }

    if(myStorage.getItem("goToCommand") !== null){
        goToCommand = myStorage.getItem("goToCommand")
    } else {
        myStorage.setItem("goToCommand", goToCommand);
    }

    if(myStorage.getItem("goToCommandActive") !== null){
        goToCommandActive = (myStorage.getItem("goToCommandActive") == 'true')
    } else {
        myStorage.setItem("goToCommandActive", goToCommandActive);
    }

    if(myStorage.getItem("videosCommandActive") !== null){
        videosCommandActive = (myStorage.getItem("videosCommandActive") == 'true')
    } else {
        myStorage.setItem("videosCommandActive", videosCommandActive);
    }

    if(myStorage.getItem("increaseFontSizeCommand") !== null){
        increaseFontSizeCommand = myStorage.getItem("increaseFontSizeCommand")
    } else {
        myStorage.setItem("increaseFontSizeCommand", increaseFontSizeCommand);
    }

    if(myStorage.getItem("increaseFontSizeCommandActive") !== null){
        increaseFontSizeCommandActive = (myStorage.getItem("increaseFontSizeCommandActive") == 'true')
    } else {
        myStorage.setItem("increaseFontSizeCommandActive", increaseFontSizeCommandActive);
    }

    if(myStorage.getItem("decreaseFontSizeCommand") !== null){
        decreaseFontSizeCommand = myStorage.getItem("decreaseFontSizeCommand")
    } else {
        myStorage.setItem("decreaseFontSizeCommand", decreaseFontSizeCommand);
    }

    if(myStorage.getItem("decreaseFontSizeCommandActive") !== null){
        decreaseFontSizeCommandActive = (myStorage.getItem("decreaseFontSizeCommandActive") == 'true')
    } else {
        myStorage.setItem("decreaseFontSizeCommandActive", decreaseFontSizeCommandActive);
    }

    if(myStorage.getItem("stopListeningCommand") !== null){
        stopListeningCommand = myStorage.getItem("stopListeningCommand")
    } else {
        myStorage.setItem("stopListeningCommand", stopListeningCommand);
    }

    if(myStorage.getItem("hiddenSectionsCommand") !== null){
        hiddenSectionsCommand = myStorage.getItem("hiddenSectionsCommand")
    } else {
        myStorage.setItem("hiddenSectionsCommand", hiddenSectionsCommand);
    }

    if(myStorage.getItem("hiddenSectionsCommandActive") !== null){
        hiddenSectionsCommandActive = (myStorage.getItem("hiddenSectionsCommandActive") == 'true')
    } else {
        myStorage.setItem("hiddenSectionsCommandActive", hiddenSectionsCommandActive);
    }

    if(myStorage.getItem("hiddenItems") !== null){
        try {
            hiddenItems = JSON.parse(myStorage.getItem("hiddenItems"))
        } catch (e) {
        }
    } else {
        myStorage.setItem("hiddenItems", JSON.stringify(hiddenItems));
    }

    if(myStorage.getItem("paragraphItems") !== null){
        try {
            paragraphItems = JSON.parse(myStorage.getItem("paragraphItems"))
        } catch (e) {
        }
    } else {
        myStorage.setItem("paragraphItems", JSON.stringify(paragraphItems));
    }

    if(myStorage.getItem("sectionsNames") !== null){
        try {
            sectionsNames = JSON.parse(myStorage.getItem("sectionsNames"))
        } catch (e) {
        }
    } else {
        myStorage.setItem("sectionsNames", JSON.stringify(sectionsNames));
    }

    if(myStorage.getItem("breadcrumbCommand") !== null){
        breadcrumbCommand = myStorage.getItem("breadcrumbCommand")
    } else {
        myStorage.setItem("breadcrumbCommand", breadcrumbCommand);
    }

    if(myStorage.getItem("breadcrumbCommandActive") !== null){
        breadcrumbCommandActive = (myStorage.getItem("breadcrumbCommandActive") == 'true')
    } else {
        myStorage.setItem("breadcrumbCommandActive", breadcrumbCommandActive);
    }

    commands = [increaseFontSizeCommand, decreaseFontSizeCommand, stopListeningCommand, readCommand, goToCommand,
                hiddenSectionsCommand, breadcrumbCommand, showOperationsCommand, showSectionsCommand, welcomeCommand]
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
    divMenu.style = "position: fixed; left: 2%; top: 2%; z-index: 100; line-height: 125%;"
    var menuLinkDiv = document.createElement("div");
    menuLinkDiv.id = "div-webaugmentation";
    var menuLink = document.createElement("a");
    menuLink.id = "a-webaugmentation";
    menuLink.href = "javascript:void(0);";
    menuLink.className = "icon";
    menuLink.addEventListener("click", toggleMenu)
    var menuIcon = document.createElement("i");
    menuIcon.className = "fa fa-bars fa-2x fa-border";
    menuIcon.style="background-color: white;";
    menuLink.appendChild(menuIcon);
    menuLinkDiv.appendChild(menuLink);
    divMenu.appendChild(menuLinkDiv);

    var divButtons = document.createElement('div')
    divButtons.id = "foldingMenu"
    divButtons.style = "padding: 10px; border: 2px solid black; display: none; background-color: white"

    var a6 = document.createElement('a');
    a6.id = "annotationsA";
    a6.addEventListener("click", function(){
        toggleMenu();
        closeLanguageMenu();
        closeCommandsMenu();
        closeReadMenu();
        toggleAnnotationsMenu();
        closeOperationsMenu()
    }, false);
    a6.text = 'Annotations';
    divButtons.appendChild(a6);
    divButtons.appendChild(document.createElement('br'));

    var toggleListeningIcon = document.createElement("i");
    toggleListeningIcon.id = "toggleListeningIcon";
    toggleListeningIcon.className = "fa fa-circle";

    var aToggleListening = document.createElement('a');
    aToggleListening.id = "toggleListeningA";
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
        myStorage.setItem("listeningActive", listeningActive);
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

    var a5 = document.createElement('a');
    a5.id = "voiceCommandsA";
    //a5.href = '';
    a5.addEventListener("click", function(){
        toggleMenu();
        closeLanguageMenu();
        toggleCommandsMenu();
        closeReadMenu();
        closeAnnotationsMenu();
        closeOperationsMenu();
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
        myStorage.setItem("listeningActive", listeningActive);
    }, false);
    divButtons.appendChild(inputVoiceCommands);
    divButtons.appendChild(document.createElement('br'));

    var aOperations = document.createElement('a');
    aOperations.id = "operationsA";
    aOperations.addEventListener("click", function(){
        toggleOperationsMenu();
    }, false);
    aOperations.text = 'Accessibility Operations';
    divButtons.appendChild(aOperations);

    var i = document.createElement('i');
    i.className = 'fa fa-close'
    i.style = "position: absolute; right: 10%; top: 20%; z-index: 100;"
    i.addEventListener("click", function(){
        closeMenu();;
    }, false);
    divButtons.appendChild(i);

    menuLinkDiv.appendChild(divButtons);
    document.body.appendChild(divMenu);

    commandsMenu();
    createAnnotationsMenu();
    createOperationsMenu();
    clickDetector();
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
  closeAnnotationsMenu();
  closeOperationsMenu();
}
function closeMenu(){
  var x = document.getElementById("foldingMenu");
  x.style.display = "none";
}

function createOperationsMenu(){

    var divButtons = document.createElement('div')
    divButtons.id = "menu-operations"
    divButtons.style = "z-index: 100; padding: 10px; border: 2px solid black; display: none; background-color: white"


    var i = document.createElement('i');
    i.className = 'fa fa-close'
    i.style = "position: absolute; right: 1%; top: 31%; z-index: 100;"
    i.addEventListener("click", function(){
        closeOperationsMenu();
    }, false);
    divButtons.appendChild(i);

    var a1 = document.createElement('a');
    a1.id = "increaseFontSizeA";
    //a1.href = '';
    a1.addEventListener("click", function(){
        if(increaseFontSizeCommandActive){
            changeFontSize('+');
            closeOperationsMenu();
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
            closeOperationsMenu();
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
    inputVideos.checked = videosCommandActive;
    inputVideos.addEventListener("change", toggleYoutubeVideos, false);
    divButtons.appendChild(inputVideos);
    divButtons.appendChild(document.createElement('br'));

    var aHiddenSections = document.createElement('a');
    aHiddenSections.id = "hiddenSectionsA";
    //aToggleSections.href = '';
    aHiddenSections.addEventListener("click", function(){
        toggleMenu();
        closeLanguageMenu();
        closeCommandsMenu();
        closeReadMenu();
        document.getElementById("hiddenSectionsInput").checked = !document.getElementById("hiddenSectionsInput").checked;
        toggleHiddenSections();
        closeOperationsMenu();
    }, false);
    aHiddenSections.text = 'Hide useless sections';
    divButtons.appendChild(aHiddenSections);
    var inputHiddenSections = document.createElement('input');
    inputHiddenSections.type = 'checkbox';
    inputHiddenSections.id = 'hiddenSectionsInput';
    inputHiddenSections.value = 'hiddenSectionsInput';
    inputHiddenSections.checked = hiddenSectionsCommandActive;
    inputHiddenSections.addEventListener("change", function(){
        toggleMenu();
        closeLanguageMenu();
        closeCommandsMenu();
        closeReadMenu();
        toggleHiddenSections();
        closeOperationsMenu();
    }, false);
    divButtons.appendChild(inputHiddenSections);
    divButtons.appendChild(document.createElement('br'));

    var aBreadcrumb = document.createElement('a');
    aBreadcrumb.id = "breadcrumbA";
    aBreadcrumb.addEventListener("click", function(){
        toggleMenu();
        closeLanguageMenu();
        closeCommandsMenu();
        closeReadMenu();
        closeAnnotationsMenu();
        closeOperationsMenu();
        document.getElementById("breadcrumbInput").checked = !document.getElementById("breadcrumbInput").checked;
        toggleBreadcrumb();
    }, false);
    aBreadcrumb.text = 'History breadcrumb';
    divButtons.appendChild(aBreadcrumb);
    var inputBreadcrumb = document.createElement('input');
    inputBreadcrumb.type = 'checkbox';
    inputBreadcrumb.id = 'breadcrumbInput';
    inputBreadcrumb.value = 'breadcrumbInput';
    inputBreadcrumb.checked = breadcrumbCommandActive;
    inputBreadcrumb.addEventListener("change", function(){
        toggleMenu();
        closeLanguageMenu();
        closeCommandsMenu();
        closeReadMenu();
        closeAnnotationsMenu();
        toggleBreadcrumb();
        closeOperationsMenu();
    }, false);
    divButtons.appendChild(inputBreadcrumb);
    divButtons.appendChild(document.createElement('br'));

    var a4 = document.createElement('a');
    a4.id = "languageA";
    //a4.href = '';
    a4.addEventListener("click", function(){
        toggleMenu();
        closeCommandsMenu();
        toggleLanguageMenu();
        closeReadMenu();
        closeOperationsMenu();
        closeAnnotationsMenu();
    }, false);
    a4.text = 'Language';
    divButtons.appendChild(a4);
    divButtons.appendChild(document.createElement('br'));

    document.getElementById("div-webaugmentation").appendChild(divButtons);


    //TODO: language management
    //changeLanguageMenu();
    toggleHiddenSections();
    createReadMenu();
    createGoToMenu();
    if(listeningActive){
        readWelcome();
    }
}

function toggleOperationsMenu(){
  var x = document.getElementById("menu-operations");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
    closeMenu();
  }
}
function closeOperationsMenu(){
  var x = document.getElementById("menu-operations");
  x.style.display = "none";
}

function readWelcome(){
    var readContent = "Welcome to " + document.title + "! The voice operations available are: ";
    for(var i = 0; i < commands.length; i++){
        readContent += commands[i] + ", ";
    }
    Read(readContent);
}

function readOperations(){
    var readContent = "The voice operations available are: ";
    for(var i = 0; i < commands.length; i++){
        readContent += commands[i] + ", ";
    }
    Read(readContent);
}

function readSections(){
    var readContent = "The sections of the website are: ";
    for(var i = 0; i < sectionsNames.length; i++){
        readContent += sectionsNames[i] + ", ";
    }
    Read(readContent);
}

function toggleIncreaseFontSize(){
    if(increaseFontSizeCommandActive){
        increaseFontSizeCommandActive = false;
        document.getElementById("increaseFontSizeA").style.setProperty("pointer-events", "none");
    } else {
        increaseFontSizeCommandActive = true;
        document.getElementById("increaseFontSizeA").style.setProperty("pointer-events", "all");
    }
    myStorage.setItem("increaseFontSizeCommandActive", increaseFontSizeCommandActive);
}
function toggleDecreaseFontSize(){
    if(decreaseFontSizeCommandActive){
        decreaseFontSizeCommandActive = false;
        document.getElementById("decreaseFontSizeA").style.setProperty("pointer-events", "none");
    } else {
        decreaseFontSizeCommandActive = true;
        document.getElementById("decreaseFontSizeA").style.setProperty("pointer-events", "all");
    }
    myStorage.setItem("decreaseFontSizeCommandActive", decreaseFontSizeCommandActive);
}

function createReadMenu(){

    var divReadMenu = document.createElement("div")
    divReadMenu.id = "menu-read";
    divReadMenu.style = "z-index: 100; padding: 10px; border: 2px solid black; display: none; background-color: white"

    var i = document.createElement('i');
    i.className = 'fa fa-close'
    i.style = "position: absolute; right: 1%; top: 31%; z-index: 100;"
    i.addEventListener("click", function(){
        closeReadMenu();
    }, false);
    divReadMenu.appendChild(i);

    try{
        sectionsNames = JSON.parse(myStorage.getItem("sectionsNames"));
        for(var sectionsIndex = 0; sectionsIndex < sectionsNames.length; sectionsIndex ++){
            var a1 = document.createElement('a');
            //a1.href = languages[languagesIndex].firstElementChild.href;
            a1.text = sectionsNames[sectionsIndex]
            var sectionName = sectionsNames[sectionsIndex]
            a1.addEventListener("click", readAloudFromSectionName, false);
            a1.sectionName = sectionName;
            divReadMenu.appendChild(a1);
            divReadMenu.appendChild(document.createElement('br'));
        }
    } catch(e){}

    document.getElementById("div-webaugmentation").appendChild(divReadMenu);
}

function updateReadMenu(){
    var divReadMenu = document.getElementById("menu-read");
    divReadMenu.innerHTML = "";

    var i = document.createElement('i');
    i.className = 'fa fa-close'
    i.style = "position: absolute; right: 1%; top: 31%; z-index: 100;"
    i.addEventListener("click", function(){
        closeReadMenu();
    }, false);
    divReadMenu.appendChild(i);

    try{
        sectionsNames = JSON.parse(myStorage.getItem("sectionsNames"));
        for(var sectionsIndex = 0; sectionsIndex < sectionsNames.length; sectionsIndex ++){
            var a1 = document.createElement('a');
            //a1.href = languages[languagesIndex].firstElementChild.href;
            a1.text = sectionsNames[sectionsIndex]
            var sectionName = sectionsNames[sectionsIndex]
            a1.addEventListener("click", readAloudFromSectionName, false);
            a1.sectionName = sectionName;
            divReadMenu.appendChild(a1);
            divReadMenu.appendChild(document.createElement('br'));
        }
    } catch(e){}
}

function toggleReadMenu(){
  var x = document.getElementById("menu-read");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
    closeMenu();
    closeOperationsMenu();
  }
}
function closeReadMenu(){
  var x = document.getElementById("menu-read");
  x.style.display = "none";
}
function toggleReadAloud(){
    var divsToHide = document.getElementsByClassName("readAloudButton");
    if(!document.getElementById("readInput").checked){
        readCommandActive = false;
        document.getElementById("readA").style.setProperty("pointer-events", "none");
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
    myStorage.setItem("readCommandActive", readCommandActive);
}


function createGoToMenu(){

    var divGoToMenu = document.createElement("div")
    divGoToMenu.id = "menu-goto";
    divGoToMenu.style = "z-index: 100; padding: 10px; border: 2px solid black; display: none; background-color: white"

    var i = document.createElement('i');
    i.className = 'fa fa-close'
    i.style = "position: absolute; right: 1%; top: 31%; z-index: 100;"
    i.addEventListener("click", function(){
        closeGoToMenu();
    }, false);
    divGoToMenu.appendChild(i);

    //headlines = document.getElementsByClassName("mw-headline")
    try{
        sectionsNames = JSON.parse(myStorage.getItem("sectionsNames"));
        for(var sectionsIndex = 0; sectionsIndex < sectionsNames.length; sectionsIndex ++){
            var a1 = document.createElement('a');
            //a1.href = languages[languagesIndex].firstElementChild.href;
            a1.text = sectionsNames[sectionsIndex]
            var sectionName = sectionsNames[sectionsIndex]
            a1.addEventListener("click", goToFromSectionName, false);
            a1.sectionName = sectionName;
            divGoToMenu.appendChild(a1);
            divGoToMenu.appendChild(document.createElement('br'));
        }
    } catch(e){}

    document.getElementById("div-webaugmentation").appendChild(divGoToMenu);
}

function updateGoToMenu(){
    var divGoToMenu = document.getElementById("menu-goto");
    divGoToMenu.innerHTML = "";

    var i = document.createElement('i');
    i.className = 'fa fa-close'
    i.style = "position: absolute; right: 1%; top: 31%; z-index: 100;"
    i.addEventListener("click", function(){
        closeGoToMenu();
    }, false);
    divGoToMenu.appendChild(i);

    try{
        var sectionsNames = JSON.parse(myStorage.getItem("sectionsNames"));
        for(var sectionsIndex = 0; sectionsIndex < sectionsNames.length; sectionsIndex ++){
            var a1 = document.createElement('a');
            //a1.href = languages[languagesIndex].firstElementChild.href;
            a1.text = sectionsNames[sectionsIndex]
            var sectionName = sectionsNames[sectionsIndex]
            a1.addEventListener("click", goToFromSectionName, false);
            a1.sectionName = sectionName;
            divGoToMenu.appendChild(a1);
            divGoToMenu.appendChild(document.createElement('br'));
        }
    } catch(e){}
}

function toggleGoToMenu(){
  var x = document.getElementById("menu-goto");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
    closeMenu();
    closeOperationsMenu();
    closeOperationsMenu();
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
    myStorage.setItem("goToCommandActive", goToCommandActive);
}

function toggleBreadcrumb(){
    if(document.getElementById("breadcrumbInput").checked){
        breadcrumbCommandActive = true;
        document.getElementById("breadcrumb").style.setProperty("display", "block");
    } else {
        breadcrumbCommandActive = false;
        document.getElementById("breadcrumb").style.setProperty("display", "none");
    }
    myStorage.setItem("breadcrumbCommandActive", breadcrumbCommandActive);
}

function toggleHiddenSections(){

  if (document.getElementById("hiddenSectionsInput").checked) {
    var all
    for(var i = 0; i < hiddenItems.length; i++){
        //console.log(hiddenItems[i]);
        if(document.getElementById(hiddenItems[i]) !== null){
            document.getElementById(hiddenItems[i]).classList.add("hideUselessSections");
        } else {
            all = document.body.getElementsByTagName("*");

            for (var j=0, max=all.length; j < max; j++) {
                if(all[j].outerHTML === hiddenItems[i]){
                    all[j].classList.add("hideUselessSections");
                }
            }
        }
    }
    hiddenSectionsCommandActive = true;
  } else {
    for(var k = 0; k < hiddenItems.length; k++){
        if(document.getElementById(hiddenItems[k]) !== null){
            document.getElementById(hiddenItems[k]).classList.remove("hideUselessSections");
        } else {
            all = document.body.getElementsByTagName("*");

            for (var z=0; z < all.length; z++) {
                if(all[z].outerHTML === hiddenItems[k]){
                    all[z].classList.remove("hideUselessSections");
                }
            }
        }
    }

    hiddenSectionsCommandActive = false;
  }

  myStorage.setItem("hiddenSectionsCommandActive", hiddenSectionsCommandActive);

  closeMenu();
  closeOperationsMenu();

}

function resetUselessSections(){

    var all
    for(var k = 0; k < hiddenItems.length; k++){
        if(document.getElementById(hiddenItems[k]) !== null){
            document.getElementById(hiddenItems[k]).classList.remove("hideUselessSections");
        } else {
            all = document.body.getElementsByTagName("*");

            for (var z=0; z < all.length; z++) {
                if(all[z].outerHTML === hiddenItems[k]){
                    all[z].classList.remove("hideUselessSections");
                }
            }
        }
    }

    hiddenSectionsCommandActive = false;
    myStorage.setItem("hiddenSectionsCommandActive", hiddenSectionsCommandActive);

    hiddenItems = [];
    myStorage.setItem("hiddenItems", JSON.stringify(hiddenItems));
    closeAnnotationsMenu();

}

function resetParagraphSections(){

    paragraphSectionsCommandActive = false;
    myStorage.setItem("paragraphSectionsCommandActive", paragraphSectionsCommandActive);

    paragraphItems = [];
    myStorage.setItem("paragraphItems", JSON.stringify(paragraphItems));
    closeAnnotationsMenu();
    updateGoToMenu();
    updateReadMenu()

}

function resetTextSections(){

    //TODO: remove text selections
}

function createAnnotationsMenu(){

    var divAnnotationsMenu = document.createElement("div")
    divAnnotationsMenu.id = "menu-annotations";
    divAnnotationsMenu.style = "z-index: 100; padding: 10px; border: 2px solid black; display: none; background-color: white"

    var i = document.createElement('i');
    i.className = 'fa fa-close'
    i.style = "position: absolute; right: 1%; top: 31%; z-index: 100;"
    i.addEventListener("click", function(){
        closeAnnotationsMenu();
    }, false);
    divAnnotationsMenu.appendChild(i);

    var a1 = document.createElement('a');
    a1.id = "annotateTextA";
    a1.text = "Annotate text sections";
    a1.addEventListener("click", toggleAnnotationsTextSections, false);
    divAnnotationsMenu.appendChild(a1);
    divAnnotationsMenu.appendChild(document.createElement('br'));

    var a2 = document.createElement('a');
    a2.id = "resetTextSectionsA";
    a2.text = "Reset text sections";
    a2.addEventListener("click", resetTextSections, false);
    divAnnotationsMenu.appendChild(a2);
    divAnnotationsMenu.appendChild(document.createElement('br'));

    var a3 = document.createElement('a');
    a3.id = "annotateParagraphA";
    a3.text = "Annotate paragraph sections";
    a3.addEventListener("click", toggleAnnotationsParagraphSections, false);
    divAnnotationsMenu.appendChild(a3);
    divAnnotationsMenu.appendChild(document.createElement('br'));

    var a3b = document.createElement('a');
    a3b.id = "saveParagraphA";
    a3b.text = "Stop and save paragraph sections";
    a3b.addEventListener("click", stopAnnotationsParagraphSections, false);
    divAnnotationsMenu.appendChild(a3b);
    divAnnotationsMenu.appendChild(document.createElement('br'));

    var a4 = document.createElement('a');
    a4.id = "resetParagraphSectionsA";
    a4.text = "Reset paragraph sections";
    a4.addEventListener("click", resetParagraphSections, false);
    divAnnotationsMenu.appendChild(a4);
    divAnnotationsMenu.appendChild(document.createElement('br'));

    var a5 = document.createElement('a');
    a5.id = "annotateUselessA";
    a5.text = "Annotate useless sections";
    a5.addEventListener("click", toggleAnnotationsUselessSections, false);
    divAnnotationsMenu.appendChild(a5);
    divAnnotationsMenu.appendChild(document.createElement('br'));

    var a6 = document.createElement('a');
    a6.id = "resetUselessSectionsA";
    a6.text = "Reset useless sections";
    a6.addEventListener("click", resetUselessSections, false);
    divAnnotationsMenu.appendChild(a6);
    divAnnotationsMenu.appendChild(document.createElement('br'));
    document.getElementById("div-webaugmentation").appendChild(divAnnotationsMenu);
}

function toggleAnnotationsMenu(){
  var x = document.getElementById("menu-annotations");
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
    closeMenu();
    closeOperationsMenu();
  }
}

function closeAnnotationsMenu(){
  var x = document.getElementById("menu-annotations");
  x.style.display = "none";
}

function toggleAnnotationsUselessSections(){
    activateClickDetector = !activateClickDetector;
    closeAnnotationsMenu()

    var all;
    if(activateClickDetector){
        annotationsUselessActive = true;
        document.getElementById("annotateUselessA").text = "Save annotated useless sections";
        $('button').attr('disabled', 'disabled');
        $('a').addClass("hideSectionsLinks");
        /*all = document.body.getElementsByTagName("*");
        for (var i = 0; i < all.length; i++) {
            all[i].classList.add('hoverColor');
        }*/
        //$('a').css({'pointer-events': 'none'});
        $("#a-webaugmentation").css({'pointer-events': 'all'});
        $("#annotationsA").css({'pointer-events': 'all'});
        $("#annotateUselessA").css({'pointer-events': 'all'});
        hiddenItemsAux = [];
    } else {
        annotationsUselessActive = false;
        document.getElementById("annotateUselessA").text = "Annotate useless sections";
        $('button').removeAttr('disabled');
        //$('a').css({'pointer-events': 'all'});
        $('a').removeClass("hideSectionsLinks");
        all = document.body.getElementsByTagName("*");
        for (var j = 0; j < all.length; j++) {
            all[j].classList.remove('hoverColor');
            all[j].classList.remove('selectedColor');
        }

        $('*[class=""]').removeAttr('class');

        hiddenItems = hiddenItems.concat(hiddenItemsAux);
        myStorage.setItem("hiddenItems", JSON.stringify(hiddenItems));
        hiddenItemsAux = [];

        toggleHiddenSections();
    }
}

function toggleAnnotationsParagraphSections(){
    activateClickDetector = !activateClickDetector;
    closeAnnotationsMenu();

    var all;
    if(activateClickDetector){
        annotationsParagraphActive = true;
        document.getElementById("annotateParagraphA").text = "Save paragraphs' section";
        $('button').attr('disabled', 'disabled');
        $('a').addClass("hideSectionsLinks");
        /*all = document.body.getElementsByTagName("*");
        for (var i = 0; i < all.length; i++) {
            all[i].classList.add('hoverColor');
        }*/
        //$('a').css({'pointer-events': 'none'});
        $("#a-webaugmentation").css({'pointer-events': 'all'});
        $("#annotationsA").css({'pointer-events': 'all'});
        $("#annotateParagraphA").css({'pointer-events': 'all'});
        $("#saveParagraphA").css({'pointer-events': 'all'});
        paragraphItemsAux = [];


    } else {
        if(Array.isArray(paragraphItemsAux) && paragraphItemsAux.length > 0){
            var result = prompt("Title of this paragraphs' section", "");

            all = document.body.getElementsByTagName("*");
            for (var j = 0; j < all.length; j++) {
                all[j].classList.remove('hoverColor');
                all[j].classList.remove('selectedColor');
            }

            $('*[class=""]').removeAttr('class');

            var jsonParagraph = new Object();
            jsonParagraph.name = result;
            jsonParagraph.value = paragraphItemsAux;
            var jsons = new Array();
            try{
                var paragraphItems = JSON.parse(myStorage.getItem("paragraphItems"));
                if(Array.isArray(paragraphItems) && paragraphItems.length > 0){
                    jsons = paragraphItems;
                }
            } catch(e){}
            jsons.push(jsonParagraph);
            myStorage.setItem("paragraphItems", JSON.stringify(jsons));
            paragraphItemsAux = [];
        }
        activateClickDetector = !activateClickDetector;

        //toggleHiddenSections();
    }
}

function stopAnnotationsParagraphSections(){
    if(activateClickDetector){
        toggleAnnotationsParagraphSections()
        annotationsParagraphActive = false;
        document.getElementById("annotateParagraphA").text = "Annotate paragraph sections";
        $('button').removeAttr('disabled');
        //$('a').css({'pointer-events': 'all'});
        $('a').removeClass("hideSectionsLinks");
        activateClickDetector = !activateClickDetector;
        $('*[class=""]').removeAttr('class');

        // save sections names from paragraphItems
        var paragraphItems = JSON.parse(myStorage.getItem("paragraphItems"));
        var sectionsNames = [];
        for(var i = 0; i < paragraphItems.length; i++){
            sectionsNames.push(paragraphItems[i].name);
        }
        myStorage.setItem("sectionsNames", JSON.stringify(sectionsNames));

        toggleReadAloud();
        updateGoToMenu();
        updateReadMenu()
        updateGrammar();
    }
}


function toggleAnnotationsTextSections(){
    activateTextDetector = !activateTextDetector;

    if(activateTextDetector){
        document.addEventListener("mouseup", doSomethingWithSelectedText);
        document.addEventListener("keyup", doSomethingWithSelectedText);
    } else{
        document.removeEventListener("mouseup", doSomethingWithSelectedText);
        document.removeEventListener("keyup", doSomethingWithSelectedText);
    }

    closeAnnotationsMenu();

}

function getSelectedText() {
    var text = "";
    if (typeof window.getSelection != "undefined") {
        text = window.getSelection().toString();
    } else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
        text = document.selection.createRange().text;
    }
    return text;
}

function doSomethingWithSelectedText() {
    var selectedText = getSelectedText();
    if (selectedText) {
        alert("Got selected text " + selectedText);
    }
}

function clickDetector(){
    document.addEventListener('click', function(event) {
        //console.log('click');
        if (event===undefined) event= window.event;
        var target= 'target' in event? event.target : event.srcElement;

        if(activateClickDetector){
            console.log('clicked on ' + target.tagName);
            //TODO: avoid deleting/hiding some elements, and activate actions such as read aloud
            var menu = document.getElementById("menu-webaugmentation");
            var menuAnnotations = document.getElementById("menu-annotations");
            if(!menu.contains(target) && !menuAnnotations.contains(target)){
                var childA = target.getElementsByTagName("a")
                var i
                if(annotationsUselessActive){
                    //target.parentNode.removeChild(target);
                    if(target.id !== null && target.id  !== '' && typeof target.id !== 'undefined'){
                        hiddenItemsAux.push(target.id);
                    } else {
                        for(i = 0; i < childA.length; i++){
                            childA[i].classList.remove("hideSectionsLinks");
                            if (childA[i].className == "")
                                childA[i].removeAttribute('class');
                        }
                        target.classList.remove("hideSectionsLinks");
                        if (target.className == "")
                            target.removeAttribute('class');
                        hiddenItemsAux.push(target.outerHTML);
                        target.classList.add("hideUselessSections");
                        hiddenItemsAux.push(target.outerHTML);
                        target.classList.remove("hideUselessSections");
                    }
                    //target.style.display = 'none';
                    target.classList.add('selectedColor');
                }
                else if(annotationsParagraphActive && target.tagName === "P"){
                    //target.parentNode.removeChild(target);
                    if(target.id !== null && target.id  !== '' && typeof target.id !== 'undefined'){
                        paragraphItemsAux.push(target.id);
                    } else {
                        for(i = 0; i < childA.length; i++){
                            childA[i].classList.remove("hideSectionsLinks");
                            if (childA[i].className == "")
                                childA[i].removeAttribute('class');
                        }
                        target.classList.remove("hideSectionsLinks");
                        if (target.className == "")
                            target.removeAttribute('class');
                        paragraphItemsAux.push(target.outerHTML);
                        /*target.classList.add("hideUselessSections");
                        paragraphItemsAux.push(target.outerHTML);
                        target.classList.remove("hideUselessSections");*/
                    }

                    //if(!target.classList.contains('selectedColor')){
                        target.classList.add('selectedColor');
                    /*} else {
                        target.classList.remove('selectedColor');
                    }*/
                }
            }
            event.stopPropagation()
            event.preventDefault()
            return false;
        }
    }, false);

    /*$("a").click(function(event) {
        console.log("a clicked!!")
        if (activateClickDetector){
            console.log("activated")
            event.stopPropagation()
            event.preventDefault()
            return false;
        }
        return !activateClickDetector;
    });*/
}

// Language management
function changeLanguageMenu(){

    try {
        var url = window.location.href;
        var urlLanguage = url.split("https://")[1].split(".")[0]
        changePredefinedVoiceLanguage(urlLanguage)
    }
    catch(error) {
        console.log(error);
    }

    var divLanguageMenu = document.createElement("div")
    divLanguageMenu.id = "menu-language";
    divLanguageMenu.style = "z-index: 100; padding: 10px; border: 2px solid black; display: none; background-color: white"

    var i = document.createElement('i');
    i.className = 'fa fa-close'
    i.style = "position: absolute; right: 1%; top: 31%; z-index: 100;"
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
    document.getElementById("div-webaugmentation").appendChild(divLanguageMenu);
}

function changePredefinedVoiceLanguage(urlLanguage){
    languageCodeSyntesis = urlLanguage
    /*switch(urlLanguage){
        case "es": languageCodeSyntesis = "es"
    }*/
}

function toggleLanguageMenu(){
  var x = document.getElementById("menu-language");
  if(x != null){
      if (x.style.display === "block") {
          x.style.display = "none";
      } else {
          x.style.display = "block";
      }
  }
}
function closeLanguageMenu(){
  var x = document.getElementById("menu-language");
  if(x != null){
      x.style.display = "none";
  }
}


// Voice management
function commandsMenu(){
    var divCommandsMenu = document.createElement("div")
    divCommandsMenu.id = "menu-commands";
    divCommandsMenu.style = "z-index: 100; padding: 10px; border: 2px solid black; display: none; background-color: white"

    var i = document.createElement('i');
    i.className = 'fa fa-close'
    i.style = "position: absolute; right: 1%; top: 31%; z-index: 100;"
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
        myStorage.setItem("readCommand", readCommand);
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
        myStorage.setItem("goToCommand", goToCommand);
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
        myStorage.setItem("increaseFontSizeCommand", increaseFontSizeCommand);
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
        myStorage.setItem("decreaseFontSizeCommand", decreaseFontSizeCommand);
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
        myStorage.setItem("stopListeningCommand", stopListeningCommand);
        console.log(result);
    }, false);
    var a4i = document.createElement('i');
    a4i.className = 'fa fa-edit'
    a4.appendChild(a4i);
    divCommandsMenu.appendChild(a4);
    divCommandsMenu.appendChild(document.createElement('br'));
    document.getElementById("div-webaugmentation").appendChild(divCommandsMenu);
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
    //focusInfo();
    textToAudio();
    toggleReadAloud();
    audioToText();
    //textSize();
    //youtubeVideos();
    toggleYoutubeVideos();
    //wikipediaLinks();
    breadCrumb();
}


// Focus info (delete unnecessary items)
/*function focusInfo(){
    //Hide selected items

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
    */

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
    }

}*/


// Speech recognition
function audioToText(){
    //headlines = document.getElementsByClassName("mw-headline")
    sectionsNames = JSON.parse(myStorage.getItem("sectionsNames"));

    updateGrammar();
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
            else if(speechToText.includes(showOperationsCommand)){
                readOperations();
            }
            else if(speechToText.includes(welcomeCommand)){
                readWelcome();
            }
            else if(speechToText.includes(showSectionsCommand)|| speechToText.includes(showSectionCommand)){
                readSections();
            }
            else if(speechToText.includes(readCommand) && readCommandActive){
                for(var sectionsIndex = 0; sectionsIndex < sectionsNames.length; sectionsIndex ++){
                    if(speechToText.includes(readCommand + " " + sectionsNames[sectionsIndex].toLowerCase())){
                        readAloudFromSectionName(sectionsNames[sectionsIndex]);
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
                for(var sectionsIndex2 = 0; sectionsIndex2 < sectionsNames.length; sectionsIndex2 ++){
                    if(speechToText.includes(goToCommand + " " + sectionsNames[sectionsIndex2].toLowerCase())){
                        goToFromSectionName(sectionsNames[sectionsIndex2]);
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
                            myStorage.setItem("readCommand", readCommand);
                        } else if(newCommandString === increaseFontSizeCommand){
                            increaseFontSizeCommand = speechToText.toLowerCase();
                            myStorage.setItem("increaseFontSizeCommand", increaseFontSizeCommand);
                        } else if(newCommandString === goToCommand){
                            goToCommand = speechToText.toLowerCase();
                            myStorage.setItem("goToCommand", goToCommand);
                        } else if(newCommandString === stopListeningCommand){
                            stopListeningCommand = speechToText.toLowerCase();
                            myStorage.setItem("stopListeningCommand", stopListeningCommand);
                        } else if(newCommandString === changeCommand){
                            changeCommand = speechToText.toLowerCase();
                            myStorage.setItem("changeCommand", changeCommand);
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

function updateGrammar(){

    var commandsGrammar = [ 'increase', 'magnify', 'read', 'play', 'font', 'size', 'decrease', 'reduce', 'stop', 'listening'];
    var commandsAux = [];
    for(var i = 0; i < commands.length; i++){
        if(commands[i] === "read" || commands[i] === "go to"){
            for(var j = 0; j < sectionsNames.length; j++){
                commandsAux.push(commands[i] + " " + sectionsNames[j].toLowerCase())
            }
        } else {
            commandsAux.push(commands[i])
        }
    }
    var grammar = '#JSGF V1.0; grammar commands; public <command> = ' + commandsGrammar.concat(commandsAux).join(' | ') + ' ;';
    console.log("grammar: " + grammar);
    var speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1);
    recognition.grammars = speechRecognitionList;
}


function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
}


// Text to Audio
function textToAudio(){
    createPlayButtons();

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

function createPlayButtons(){
    $('p').each(function() {
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
}

var timeoutResumeInfinity;

function readAloudFromSectionName(sectionName){
    closeReadMenu();
    var sectionNameToRead = sectionName;
    if(typeof sectionName.parentElement === 'undefined' && typeof sectionName.currentTarget !== 'undefined'){
        sectionNameToRead = sectionName.currentTarget.sectionName
    }
    console.log("sectionNameToRead: " + sectionNameToRead);
    var readContent = ""
    var paragraphItems = JSON.parse(myStorage.getItem("paragraphItems"));
    for(var i = 0; i < paragraphItems.length; i++){
        if(paragraphItems[i].name === sectionNameToRead){
            for(var j = 0; j < paragraphItems[i].value.length; j++){
                var domParser = new DOMParser().parseFromString(paragraphItems[i].value[j], 'text/html');
                readContent += domParser.body.innerText;
                console.log("domParser: " + JSON.stringify(domParser));
                console.log("content: " + readContent);
            }
        }
    }
    Read(readContent);
}

function Read(message){
    //console.log("Read function: " + message)
    window.speechSynthesis.cancel();
    clearTimeout(timeoutResumeInfinity);
    var reader = new SpeechSynthesisUtterance(message);
    reader.rate = 0.75;
    reader.lang = languageCodeSyntesis;
    reader.onstart = function(event) {
        recognition.abort();
        resumeInfinity();
    };
    reader.onend = function(event) {
        clearTimeout(timeoutResumeInfinity);
        $('#cancel').css('visibility', 'hidden');
        if(listeningActive){
            recognition.start();
        }
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
function goToFromSectionName(sectionName){
    var sectionNameToGo = sectionName;
    if(typeof sectionName.parentElement === 'undefined' && typeof sectionName.currentTarget !== 'undefined'){
        sectionNameToGo = sectionName.currentTarget.sectionName
    }
    console.log("goToFromSectionName: " + sectionNameToGo);
    closeGoToMenu();
    closeMenu();
    closeOperationsMenu();

    $('*[class=""]').removeAttr('class');

    var sectionsNames = myStorage.getItem("sectionsNames");
    if(sectionsNames.includes(sectionNameToGo)){

        $('.readAloudButton').attr('disabled', 'disabled');

        var textElement
        var paragraphItems = JSON.parse(myStorage.getItem("paragraphItems"));
        for(var i = 0; i < paragraphItems.length; i++){
            if(sectionNameToGo === paragraphItems[i].name){

                var allp = document.body.getElementsByTagName("P");
                for (var j=0, max=allp.length; j < max; j++) {
                    for(var k = 0; k < paragraphItems[i].value.length; k++){
                        if(allp[j].outerHTML === paragraphItems[i].value[k]){
                            textElement = allp[j]
                            textElement.scrollIntoView()
                            $('.readAloudButton').removeAttr('disabled');
                            toggleReadAloud();
                            return;
                        }
                    }
                }
            }
        }

        for(var buttonIndex = 0; buttonIndex < document.getElementsByClassName("readAloudButton").length; buttonIndex++){
            if(document.getElementById("readInput").checked){
                document.getElementsByClassName("readAloudButton")[buttonIndex].style.display = "none";
            } else {
                document.getElementsByClassName("readAloudButton")[buttonIndex].style.display = "block";
                //$('.readAloudButton').removeAttr('disabled');
            }
        }
        paragraphItems = JSON.parse(myStorage.getItem("paragraphItems"));
        for(i = 0; i < paragraphItems.length; i++){
            if(sectionNameToGo === paragraphItems[i].name){

                allp = document.body.getElementsByTagName("P");
                for (j=0, max=allp.length; j < max; j++) {
                    for(k = 0; k < paragraphItems[i].value.length; k++){
                        if(allp[j].outerHTML === paragraphItems[i].value[k]){
                            textElement = allp[j]
                            textElement.scrollIntoView()
                            $('.readAloudButton').removeAttr('disabled');
                            toggleReadAloud();
                            return;
                        }
                    }
                }
            }
        }

        toggleReadAloud();


    }
}

// Youtube videos
function youtubeVideos(){
    //videoRequest($("#firstHeading").prop('innerText'));
    videoRequest(document.title);
}

function videoRequest(searchTerm) {
    var url = 'https://www.googleapis.com/youtube/v3/search';
    var params = {
        part: 'snippet',
        //key: 'AIzaSyBB9Vs9M1WcozRTjf9rGBU-M-HEpGYGXv8',
        key: 'AIzaSyA9c14XqejmcLW_KMVlSZZngrPfyF3X5rY',
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

    //$('.mw-parser-output').append("<div id='youtubeVideos' style='display: block'><br><h2><span class='mw-headline' id='Youtube_videos'>Youtube videos</span></h2></div>")

    var youtubeVideoContent = document.createElement("DIV");
    youtubeVideoContent.innerHTML = "<div id='youtubeVideos' style='display: block'><br><h2><span class='mw-headline' id='Youtube_videos'>Youtube videos</span></h2></div>";
    document.body.appendChild(youtubeVideoContent);
    $('#youtubeVideos').append(content)

}

function goToVideos(){
    if(videosCommandActive){
        toggleMenu();
        $(window).scrollTop($('#youtubeVideos').offset().top);
    }
}

function toggleYoutubeVideos(){
  var x = document.getElementById("youtubeVideos");
  if (!document.getElementById("youtubeVideosInput").checked) {
    if(x != null){
        x.style.display = "none";
    }
    document.getElementById("goToVideosA").style.setProperty("pointer-events", "none");
    videosCommandActive = false;
  } else {
    if(x != null){
        x.style.display = "block";
    } else {
        youtubeVideos();
    }
    document.getElementById("goToVideosA").style.setProperty("pointer-events", "all");
    videosCommandActive = true;
  }
  myStorage.setItem("videosCommandActive", videosCommandActive);
}

// Wikipedia Links
/*function wikipediaLinks(){
    //Index
    $('.new').each(function() {
        var word = $(this).prop('href');
        word = word.split("title=")[1];
        word = word.split("&")[0];
        var auxlink = "https://en.wikipedia.org/wiki/"+word;
        $(this).prop('href', auxlink);
    });
}*/


// Bread Crumb (History)
function breadCrumb(){
    var lastVisitedSitesURL = []
    var lastVisitedSitesTitle = []
    var breadcrumb = document.createElement('div');
    breadcrumb.id = "breadcrumb";

    var maxBreadCrumb = 4;
    if(myStorage.getItem("lastVisitedSitesTitle" + "0") !== document.title){
        lastVisitedSitesURL.push(location.href)
        lastVisitedSitesTitle.push(document.title)
    } else{
        maxBreadCrumb++;
    }
    for(var i = 0; i < maxBreadCrumb; i++){
        if(myStorage.getItem("lastVisitedSitesURL" + i) !== null){
            lastVisitedSitesURL.push(myStorage.getItem("lastVisitedSitesURL" + i))
        }
        if(myStorage.getItem("lastVisitedSitesTitle" + i) !== null){
            lastVisitedSitesTitle.push(myStorage.getItem("lastVisitedSitesTitle" + i))
        }
    }
    for(var lastVisitedSitesIndex = 0; lastVisitedSitesIndex < lastVisitedSitesURL.length; lastVisitedSitesIndex++){
        myStorage.setItem("lastVisitedSitesURL" + lastVisitedSitesIndex, lastVisitedSitesURL[lastVisitedSitesIndex])
        myStorage.setItem("lastVisitedSitesTitle" + lastVisitedSitesIndex, lastVisitedSitesTitle[lastVisitedSitesIndex])
    }
    document.body.appendChild(breadcrumb);
    $('#breadcrumb').css({
        'position': 'absolute',
        'height': '50px',
        'left': '15%',
        'top': '0',
        //'width': '100%',
        'padding': '10px',
        //'background-color': '#FFFFFF',
        'vertical-align': 'bottom',
        'visibility': 'visible',
    });
    var lastVisitedSitesURLReverse = lastVisitedSitesURL.reverse()
    var lastVisitedSitesTitleReverse = lastVisitedSitesTitle.reverse()
    for(var x = 0; x < lastVisitedSitesURLReverse.length; x++){
        var link = document.createElement("a");
        if(x < lastVisitedSitesURLReverse.length - 1) {
            link.href = lastVisitedSitesURLReverse[x];
            link.style = "color: #0645ad !important;"
        } else {
            link.style = "color: #000000 !important;text-decoration: none;"
        }
        link.innerText = lastVisitedSitesTitleReverse[x];
        link.className = "linkBread";
        $('#breadcrumb').append(link);
        document.getElementById("breadcrumb").innerHTML += " > ";
    }
    $('.linkBread').each(function(){
        $(this).css({
            'padding':'3px',
        });
    });

    toggleBreadcrumb()
}

/*function setCookie(cname, cvalue, exdays) {
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
}*/

function createCSSSelector (selector, style) {
  if (!document.styleSheets) return;
  if (document.getElementsByTagName('head').length == 0) return;

  var styleSheet,mediaType;

  if (document.styleSheets.length > 0) {
    for (var i = 0, l = document.styleSheets.length; i < l; i++) {
      if (document.styleSheets[i].disabled)
        continue;
      var media = document.styleSheets[i].media;
      mediaType = typeof media;

      if (mediaType === 'string') {
        if (media === '' || (media.indexOf('screen') !== -1)) {
          styleSheet = document.styleSheets[i];
        }
      }
      else if (mediaType=='object') {
        if (media.mediaText === '' || (media.mediaText.indexOf('screen') !== -1)) {
          styleSheet = document.styleSheets[i];
        }
      }

      if (typeof styleSheet !== 'undefined')
        break;
    }
  }

  if (typeof styleSheet === 'undefined') {
    var styleSheetElement = document.createElement('style');
    styleSheetElement.type = 'text/css';
    document.getElementsByTagName('head')[0].appendChild(styleSheetElement);

    for (i = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i].disabled) {
        continue;
      }
      styleSheet = document.styleSheets[i];
    }

    mediaType = typeof styleSheet.media;
  }

  if (mediaType === 'string') {
    for (i = 0, l = styleSheet.rules.length; i < l; i++) {
      if(styleSheet.rules[i].selectorText && styleSheet.rules[i].selectorText.toLowerCase()==selector.toLowerCase()) {
        styleSheet.rules[i].style.cssText = style;
        return;
      }
    }
    styleSheet.addRule(selector,style);
  }
  else if (mediaType === 'object') {
    var styleSheetLength = (styleSheet.cssRules) ? styleSheet.cssRules.length : 0;
    for (i = 0; i < styleSheetLength; i++) {
      if (styleSheet.cssRules[i].selectorText && styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
        styleSheet.cssRules[i].style.cssText = style;
        return;
      }
    }
    styleSheet.insertRule(selector + '{' + style + '}', styleSheetLength);
  }
}



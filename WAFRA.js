// ==UserScript==
// @name         WAFRA
// @updateURL    https://raw.githubusercontent.com/cgmora12/Web-Augmentation-Framework-for-Accessibility/master/WAFRA.js
// @downloadURL  https://raw.githubusercontent.com/cgmora12/Web-Augmentation-Framework-for-Accessibility/master/WAFRA.js
// @namespace    http://tampermonkey.net/
// @version      1.0.55
// @description  Web Augmentation Framework for Accessibility (WAFRA)
// @author       Cesar Gonzalez Mora
// @match        *://*/*
// @noframes
// @exclude      *://www.youtube.com/embed/*
// @grant        none
// @require http://code.jquery.com/jquery-3.3.1.slim.min.js
// @require http://code.jquery.com/jquery-3.3.1.min.js
// ==/UserScript==


/*********************** Variables ************************/
var myStorage = window.localStorage;
const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
const recognition = new SpeechRecognition();
var timeoutResumeInfinity;

var listeningActive = true;

var recognitionActive;
var recognitionFailedFirstTime = true;
var recognitionFailedText = "Command not recognised, please try again.";
var reading = false;
var readFirstTime = true;

var localStoragePrefix;

var operations = [];
var annotations = [];

var languageCodeSyntesis = "en";
var languageCodeCommands = "en";

var listOperationsCommand = "list operations";
var listSectionsCommand = "list sections";
var listSectionCommand = "list section";
var welcomeCommand = "welcome";
var stopListeningCommand = "stop listening";
var changeCommand = "change command";
var cancelCommand = "cancel";
var changeCommandQuestion = "which command";
var newCommandQuestion = "which is the new command";
var changeCommandInProcess1 = false;
var changeCommandInProcess2 = false;
var newCommandString = "";
var activateClickDetector = false;
var activateTextDetector = false;

var paragraphItemsXPath = [];
var paragraphItemsXPathAux = [];

var annotationActive = false;
var annotationId = "";
var annotatedItemsAux = [];
var annotationElements = [];

var operationToChange;


/*********************** Page is loaded ************************/
$(document).ready(function() {
    createCSSSelector('.hideSectionsLinks', 'pointer-events: none');
    createCSSSelector('.hideUselessSections', 'display: none !important;');
    createCSSSelector('.hoverColor:hover', 'background-color: grey !important;');
    createCSSSelector('.selectedColor', 'background-color: grey !important;;');
    $('*[class=""]').removeAttr('class');

    var hiddenButton = document.createElement("button");
    hiddenButton.style.display = "none";
    document.body.appendChild(hiddenButton);
    hiddenButton.click();

    clickDetector();

    // Local storage independent for each visitated website
    localStoragePrefix = encodeURI(document.URL) + "_";


    /*********************** Add new annotations here ************************/
    var textAnnotation = new TextAnnotation("textAnnotation", "Text Annotation", ["text"], []);
    var paragraphAnnotation = new ParagraphAnnotation("paragraphAnnotation", "Paragraph Annotation", ["P"], []);
    var uselessAnnotation = new UselessAnnotation("uselessAnnotation", "Useless sections Annotation", ["all"], []);

    /*********************** Add new operations here ************************/
    var increaseFontSizeOperation = new IncreaseFontSizeOperation("increaseFontSizeOperation", "Increase Font Size", "increase font size", true, true, true, false, []);
    var decreaseFontSizeOperation = new DecreaseFontSizeOperation("decreaseFontSizeOperation", "Decrease Font Size", "decrease font size", true, true, true, false, []);
    var readAloudOperation = new ReadAloudOperation("readAloud", "Read Aloud", "read aloud", true, true, true, true, ["textAnnotation", "paragraphAnnotation"]);
    var goToOperation = new GoToOperation("goTo", "Go To", "go to", true, true, true, true, ["textAnnotation", "paragraphAnnotation"]);
    var videosOperation = new VideosOperation("videos", "Videos", "videos", true, true, true, false, []);
    var breadCrumbOperation = new BreadcrumbOperation("breadcrumb", "Breadcrumb", "breadcrumb", true, true, true, false, []);
    var hideOperation = new HideOperation("hide", "Hide useless sections", "hide", true, true, true, false, ["uselessAnnotation"]);

    initWAFRA();
    textToAudio();
    audioToText();

    var wafra = new WAFRA();
    wafra.getAndSetStorage();
    wafra.createWebAugmentedMenu();
    wafra.createAnnotationsMenu();
    wafra.createOperationsMenu();
    wafra.createCommandsMenu();
    document.onkeydown = KeyPress;

    setTimeout(function(){
        toggleHiddenSections();
    }, 1000);


});


/**
 * Class WAFRA.
 *
 * @class WAFRA
 */
class WAFRA {

    constructor() {

    }

    getAndSetStorage() {
        for(var annotationsIndex = 0; annotationsIndex < annotations.length; annotationsIndex++){
            // Annotated items
            if(myStorage.getItem(localStoragePrefix + annotations[annotationsIndex].id) !== null){
                annotations[annotationsIndex].items = myStorage.getItem(localStoragePrefix + annotations[annotationsIndex].id);
            } else {
                myStorage.setItem(localStoragePrefix + annotations[annotationsIndex].id, annotations[annotationsIndex].items);
            }
        }
        for(var operationsIndex = 0; operationsIndex < operations.length; operationsIndex++){
            // Voice commands names
            if(myStorage.getItem(localStoragePrefix + operations[operationsIndex].id) !== null){
                operations[operationsIndex].voiceCommand = myStorage.getItem(localStoragePrefix + operations[operationsIndex].id);
            } else {
                myStorage.setItem(localStoragePrefix + operations[operationsIndex].id, operations[operationsIndex].voiceCommand);
            }

            // Operations & commands active?
            if(myStorage.getItem(localStoragePrefix + operations[operationsIndex].id + "Active") !== null){
                operations[operationsIndex].active = (myStorage.getItem(localStoragePrefix + operations[operationsIndex].id + "Active") == 'true');
            } else {
                myStorage.setItem(localStoragePrefix + operations[operationsIndex].id + "Active", operations[operationsIndex].active);
            }
        }

        //TODO: refactor
        if(myStorage.getItem(localStoragePrefix + "paragraphItemsXPath") !== null){
            try {
                paragraphItemsXPath = JSON.parse(myStorage.getItem(localStoragePrefix + "paragraphItemsXPath"))
            } catch (e) {
            }
        } else {
            myStorage.setItem(localStoragePrefix + "paragraphItemsXPath", JSON.stringify(paragraphItemsXPath));
        }
    }


    createWebAugmentedMenu(){
        createMenus();
    }

    createAnnotationsMenu(){
        createAnnotationsMenu();
    }

    createOperationsMenu(){
        createOperationsMenu();
    }

    createCommandsMenu(){
        createCommandsMenu();
    }

}

/**
 * Abstract Class Annotation.
 *
 * @class Annotation
 */
class Annotation {

    /*id;
    name;
    domElement;*/

    constructor() {
        if (this.constructor == Annotation) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    initAnnotationProcess() {
        throw new Error("Method 'initAnnotationProcess()' must be implemented.");
    }

    start() {
        throw new Error("Method 'start()' must be implemented.");
    }

    save() {
        throw new Error("Method 'save()' must be implemented.");
    }

    stop() {
        throw new Error("Method 'stop()' must be implemented.");
    }

    reset() {
        throw new Error("Method 'reset()' must be implemented.");
    }

    undo() {
        throw new Error("Method 'undo()' must be implemented.");
    }


    initAnnotation(id, name, domElements, items) {
        this.id = id;
        this.name = name;
        this.domElements = domElements;
        this.items = items
        annotations.push(this);
    }
}

class TextAnnotation extends Annotation {

    constructor(id, name, domElements, items){
        super();
        this.initAnnotation(id, name, domElements, items);
        /*this.id = id;
        this.name = name;
        this.domElement = domElement;*/
    }

    initAnnotationProcess() {
    }

    start() {
        console.log("annotationActive: " + annotationActive);
        if(!annotationActive){
            annotationActive = true;
            annotationId = this.id;
            startAnnotations(this);
        }
    }

    save() {
        saveAnnotations(this);
    }

    stop() {
        stopAnnotations(this);
    }

    reset() {
        resetAnnotationsById(this.id);
    }

    undo() {
        undoAnnotations(this);
    }
}

class ParagraphAnnotation extends Annotation {

    constructor(id, name, domElements, items){
        super();
        this.initAnnotation(id, name, domElements, items);
    }

    initAnnotationProcess() {
    }

    start() {
        console.log("annotationActive: " + annotationActive);
        if(!annotationActive){
            annotationActive = true;
            annotationId = this.id;
            startAnnotations(this);
        }
    }

    save() {
        saveAnnotations(this);
    }

    stop() {
        stopAnnotations(this);
    }

    reset() {
        resetAnnotationsById(this.id);
    }

    undo() {
        undoAnnotations(this);
    }
}


class UselessAnnotation extends Annotation {

    constructor(id, name, domElements, items){
        super();
        this.initAnnotation(id, name, domElements, items);
    }

    initAnnotationProcess() {
    }

    start() {
        console.log("annotationActive: " + annotationActive);
        if(!annotationActive){
            annotationActive = true;
            annotationId = this.id;
            startAnnotations(this);
        }
    }

    save() {
        saveAnnotations(this);
    }

    stop() {
        stopAnnotations(this);
    }

    reset() {
        resetAnnotationsById(this.id);
    }

    undo() {
        undoAnnotations(this);
    }
}


/*********************** Add new annotations classes here ************************/


/**
 * Abstract Class Operation.
 *
 * @class Operation
 */
class Operation {

    /*id;
    name;
    voiceCommand;
    activable;
    editable;*/

    constructor() {
        if (this.constructor == Operation) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    configureOperation() {
        throw new Error("Method 'initOperation()' must be implemented.");
    }

    initOperation() {
        throw new Error("Method 'initOperation()' must be implemented.");
    }

    startOperation() {
        throw new Error("Method 'startOperation()' must be implemented.");
    }

    stopOperation() {
        throw new Error("Method 'stopOperation()' must be implemented.");
    }


    initOperation(id, name, voiceCommand, activable, active, editable, hasMenu, annotations) {
        this.id = id;
        this.name = name;
        this.voiceCommand = voiceCommand;
        //this.section = section;
        this.activable = activable;
        this.active = active;
        this.editable = editable;
        this.hasMenu = hasMenu;
        this.annotations = annotations;
        operations.push(this);
    }
}


class IncreaseFontSizeOperation extends Operation {
    constructor(id, name, voiceCommand, activable, active, editable, hasMenu, annotations){
        super();
        this.initOperation(id, name, voiceCommand, activable, active, editable, hasMenu, annotations);
    }

    configureOperation(){

    }

    startOperation() {
        var scroll = window.scrollY;
        var totalScroll = Math.max(document.body.scrollHeight, document.body.offsetHeight,
                                   document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);

        var bodyContent = document.getElementsByTagName('div');

        for(var i = 0; i < bodyContent.length; i++) {
            var styleI = window.getComputedStyle(bodyContent[i], null).getPropertyValue('font-size');
            var fontSizeI = parseFloat(styleI);
            bodyContent[i].style.fontSize = (fontSizeI + 2) + 'px';
        }

        var currentTotalScroll = Math.max(document.body.scrollHeight, document.body.offsetHeight,
                                          document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
        var currentScroll = (scroll * currentTotalScroll) / totalScroll;
        window.scrollTo(0, currentScroll);
    }

    stopOperation() {
        console.log("Stop operation");
    }
}


class DecreaseFontSizeOperation extends Operation {
    constructor(id, name, voiceCommand, activable, active, editable, hasMenu, annotations){
        super();
        this.initOperation(id, name, voiceCommand, activable, active, editable, hasMenu, annotations);
    }

    configureOperation(){

    }

    startOperation() {
        var scroll = window.scrollY;
        var totalScroll = Math.max(document.body.scrollHeight, document.body.offsetHeight,
                                   document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);

        var bodyContent = document.getElementsByTagName('div');

        for(var j = 0; j < bodyContent.length; j++) {
            var styleJ = window.getComputedStyle(bodyContent[j], null).getPropertyValue('font-size');
            var fontSizeJ = parseFloat(styleJ);
            bodyContent[j].style.fontSize = (fontSizeJ - 2) + 'px';
        }

        var currentTotalScroll = Math.max(document.body.scrollHeight, document.body.offsetHeight,
                                          document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
        var currentScroll = (scroll * currentTotalScroll) / totalScroll;
        window.scrollTo(0, currentScroll);
    }

    stopOperation() {
        console.log("Stop operation");
    }
}

class ReadAloudOperation extends Operation {
    constructor(id, name, voiceCommand, activable, active, editable, hasMenu, annotations){
        super();
        this.initOperation(id, name, voiceCommand, activable, active, editable, hasMenu, annotations);
    }

    configureOperation() {
        //TODO: annotations parameters as objects
        createSubmenuForOperationAndAnnotations("menu-" + this.id, this);
    }

    openMenu() {
        closeOperationsMenu();
        showSubmenu("menu-" + this.id);
    }

    startOperation(params) {
        var sectionNameParam = params.currentTarget.sectionName;
        var operationParam = params.currentTarget.operation;
        readAloudFromSectionName("menu-" + operationParam.id, operationParam, sectionNameParam);
    }

    stopOperation() {
        console.log("Stop operation");
    }
}

function readAloudFromSectionName(menuId, operation, sectionName){

    var annotationsForOperation = operation.annotations;
    closeSubmenu(menuId);
    var sectionNameToRead = sectionName;
    if(typeof sectionName.parentElement === 'undefined' && typeof sectionName.currentTarget !== 'undefined'){
        sectionNameToRead = sectionName.currentTarget.sectionName
    }
    console.log("readFromSectionName: " + sectionNameToRead);
    //closeGoToMenu();
    closeMenu();
    closeOperationsMenu();

    var readContent = ""

    var sectionsNames;
    for(var i = 0; i < annotationsForOperation.length; i++){
        var items = JSON.parse(myStorage.getItem(localStoragePrefix + annotationsForOperation[i]));
        for(var j = 0; j < items.length; j++){
            if(sectionNameToRead === items[j].name){
                if(annotationsForOperation[i] === "textAnnotation"){
                    readContent += "Section " + sectionNameToRead + ". " ;
                    if(readFirstTime){
                        readFirstTime = false;
                        readContent += "You can use control + space to stop the reading aloud operation. ";
                    }
                    for(var b = 0; b < items[j].value.length; b++){
                        readContent += items[j].value[b] + " ";
                        console.log("content: " + readContent);
                    }
                } else {
                    readContent += "Section " + sectionNameToRead + ". " ;
                    if(readFirstTime){
                        readFirstTime = false;
                        readContent += "You can use control + space to stop the reading aloud operation. ";
                    }
                    for(var z = 0; z < items[j].value.length; z++){
                        var element = getElementByXPath(items[j].value[z]);
                        var domParser = new DOMParser().parseFromString(element.outerHTML, 'text/html');
                        readContent += domParser.body.innerText;
                        console.log("domParser: " + JSON.stringify(domParser));
                        console.log("content: " + readContent);
                    }
                }
            }
        }
    }
    Read(readContent);
}

class GoToOperation extends Operation {
    constructor(id, name, voiceCommand, activable, active, editable, hasMenu, annotations){
        super();
        this.initOperation(id, name, voiceCommand, activable, active, editable, hasMenu, annotations);
    }

    configureOperation() {
        //TODO: annotations parameters as objects
        createSubmenuForOperationAndAnnotations("menu-" + this.id, this);
    }

    openMenu() {
        closeOperationsMenu();
        showSubmenu("menu-" + this.id);
    }

    startOperation(params) {
        var sectionNameParam = params.currentTarget.sectionName;
        var operationParam = params.currentTarget.operation;
        goToFromSectionName("menu-" + operationParam.id, operationParam, sectionNameParam);
    }

    stopOperation() {
        console.log("Stop operation");
    }
}

// Go to
function goToFromSectionName(menuId, operation, sectionName){
    var annotationsForOperation = operation.annotations;
    closeSubmenu(menuId);
    var sectionNameToGo = sectionName;
    if(typeof sectionName.parentElement === 'undefined' && typeof sectionName.currentTarget !== 'undefined'){
        sectionNameToGo = sectionName.currentTarget.sectionName
    }
    console.log("goToFromSectionName: " + sectionNameToGo);
    //closeGoToMenu();
    closeMenu();
    closeOperationsMenu();

    var sectionsNames;
    for(var i = 0; i < annotationsForOperation.length; i++){
        var items = JSON.parse(myStorage.getItem(localStoragePrefix + annotationsForOperation[i]));
        for(var j = 0; j < items.length; j++){
            if(sectionNameToGo === items[j].name){
                if(annotationsForOperation[i] === "textAnnotation"){
                    if(items[j].value.length > 0){
                        var foundItem = $("*:contains('" + items[j].value[0] + "'):last").offset();
                        if(typeof foundItem != 'undefined'){
                            $(window).scrollTop(foundItem.top);
                        }
                    }
                } else {
                    var element = getElementByXPath(items[j].value[0]);
                    element.scrollIntoView();
                }
            }
        }
    }

}

// Videos
class VideosOperation extends Operation {
    constructor(id, name, voiceCommand, activable, active, editable, hasMenu, annotations){
        super();
        this.initOperation(id, name, voiceCommand, activable, active, editable, hasMenu, annotations);
    }

    configureOperation() {
    }

    startOperation() {
        goToVideos();
    }

    stopOperation() {
        console.log("Stop operation");
    }
}

// BreadCrumb
class BreadcrumbOperation extends Operation {
    constructor(id, name, voiceCommand, activable, active, editable, hasMenu){
        super();
        this.initOperation(id, name, voiceCommand, activable, active, editable, hasMenu);
    }

    configureOperation() {
        breadcrumb();
    }

    startOperation() {

    }

    stopOperation() {
        console.log("Stop operation");
    }
}

// Hide sections
class HideOperation extends Operation {
    constructor(id, name, voiceCommand, activable, active, editable, hasMenu, annotations){
        super();
        this.initOperation(id, name, voiceCommand, activable, active, editable, hasMenu, annotations);
    }

    configureOperation() {

    }

    startOperation() {

    }

    stopOperation() {
        console.log("Stop operation");
    }
}


/*********************** Add new operations classes here ************************/


// *************************** Helpers ***************************

function initWAFRA() {
    var link1 = document.createElement('link');
    link1.rel = 'stylesheet';
    link1.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
    document.head.appendChild(link1);
    var link2 = document.createElement('link');
    link1.rel = 'stylesheet';
    link2.href= 'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css';
    document.head.appendChild(link2);

    var divMenu = document.createElement("div");
    divMenu.id = "menu-webaugmentation";
    divMenu.style = "position: fixed; left: 2%; top: 2%; z-index: 100; line-height: 140%;";
    var menuLinkDiv = document.createElement("div");
    menuLinkDiv.id = "div-webaugmentation";
    var menuLink = document.createElement("a");
    menuLink.id = "a-webaugmentation";
    menuLink.href = "javascript:void(0);";
    menuLink.className = "icon";
    menuLink.addEventListener("click", toggleMenu);
    var menuIcon = document.createElement("i");
    menuIcon.className = "fa fa-bars fa-2x fa-border";
    menuIcon.style="background-color: white;";
    menuLink.appendChild(menuIcon);
    menuLinkDiv.appendChild(menuLink);
    divMenu.appendChild(menuLinkDiv);
    document.body.appendChild(divMenu);
}


function createMenus(){

    var divButtons = document.createElement('div');
    divButtons.id = "foldingMenu";
    divButtons.style = "padding: 10px; border: 2px solid black; display: none; background-color: white";

    if(myStorage.getItem(localStoragePrefix + "listeningActive") !== null){
        listeningActive = (myStorage.getItem(localStoragePrefix + "listeningActive") == 'true')
    } else {
        myStorage.setItem(localStoragePrefix + "listeningActive", listeningActive);
    }

    recognitionActive = listeningActive;

    var toggleListeningIcon = document.createElement("i");
    toggleListeningIcon.id = "toggleListeningIcon";
    toggleListeningIcon.className = "fa fa-circle";

    var aToggleListening = document.createElement('a');
    aToggleListening.id = "toggleListeningA";
    aToggleListening.addEventListener("click", function(){
        closeMenu();
        if(listeningActive){
            if(recognitionActive){
                console.log("recognition deactivated")
                recognitionActive = false;
                recognition.abort();
            }
            aToggleListening.text = 'Start Listening';
            listeningActive = false;
            toggleListeningIcon.style = "color:red; margin-left: 8px";
        } else{
            if(!recognitionActive){                
                console.log("recognition activated")
                recognitionActive = true;
                recognition.start();
            }
            aToggleListening.text = 'Stop Listening';
            listeningActive = true;
            inputVoiceCommands.checked = listeningActive;
            toggleListeningIcon.style = "color:gray; margin-left: 8px";
        }
        myStorage.setItem(localStoragePrefix + "listeningActive", listeningActive);
    }, false);
    if(recognitionActive){
        aToggleListening.text = 'Stop Listening';
        toggleListeningIcon.style = "color:gray; margin-left: 8px";
    }
    else{
        aToggleListening.text = 'Start Listening';
        toggleListeningIcon.style = "color:red; margin-left: 8px";
    }
    divButtons.appendChild(aToggleListening);
    divButtons.appendChild(toggleListeningIcon);
    divButtons.appendChild(document.createElement('br'));

    var a5 = document.createElement('a');
    a5.id = "voiceCommandsA";
    //a5.href = '';
    a5.addEventListener("click", function(){
        toggleMenu();
        toggleCommandsMenu();
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
            if(recognitionActive){
                console.log("recognition deactivated")
                recognitionActive = false;
                recognition.abort();
            }
            aToggleListening.text = 'Start Listening';
            listeningActive = false;
            toggleListeningIcon.style = "color:red; margin-left: 8px";
        } else {
            if(!recognitionActive){
                console.log("recognition activated")
                recognitionActive = true;
                recognition.start();
            }
            aToggleListening.text = 'Stop Listening';
            toggleListeningIcon.style = "color:gray; margin-left: 8px";
            listeningActive = true;
        }
        myStorage.setItem(localStoragePrefix + "listeningActive", listeningActive);
    }, false);
    divButtons.appendChild(inputVoiceCommands);
    divButtons.appendChild(document.createElement('br'));

    var aOperations = document.createElement('a');
    aOperations.id = "operationsA";
    aOperations.addEventListener("click", toggleOperationsMenu, false);
    aOperations.text = 'Accessibility Operations';
    divButtons.appendChild(aOperations);

    var i = document.createElement('i');
    i.className = 'fa fa-close'
    i.style = "position: absolute; right: 10%; top: 20%; z-index: 100;"
    i.addEventListener("click", closeMenu, false);
    divButtons.appendChild(i);


    document.getElementById("div-webaugmentation").appendChild(divButtons);

}

function createAnnotationsMenu(){

    var divMenuAnnotations = document.createElement("div");
    divMenuAnnotations.id = "menu-intermediary";
    divMenuAnnotations.style = "position: fixed; right: 2%; top: 2%; z-index: 101 !important; line-height: 140%;"
    var menuAnnotationsLinkDiv = document.createElement("div");
    menuAnnotationsLinkDiv.id = "div-intermediary";
    menuAnnotationsLinkDiv.style = "text-align: right;";
    var menuAnnotationsLink = document.createElement("a");
    menuAnnotationsLink.id = "a-intermediary";
    menuAnnotationsLink.href = "javascript:void(0);";
    menuAnnotationsLink.className = "icon";
    menuAnnotationsLink.addEventListener("click", toggleAnnotationsMenu)
    var menuAnnotationsIcon = document.createElement("i");
    menuAnnotationsIcon.className = "fa fa-pencil-square-o fa-2x fa-border";
    menuAnnotationsIcon.style="background-color: white;";
    menuAnnotationsLink.appendChild(menuAnnotationsIcon);

    var aSave = document.createElement('a');
    aSave.id = "saveAnnotationsA";
    aSave.href = "javascript:void(0);";
    aSave.className = "icon";
    aSave.title = "Save";
    aSave.style = "display: none";
    aSave.addEventListener("click", saveAnnotationsSections, false);
    var saveIcon = document.createElement("i");
    saveIcon.className = "fa fa-floppy-o fa-2x fa-border";
    saveIcon.style="background-color: white;";
    aSave.appendChild(saveIcon);
    menuAnnotationsLinkDiv.appendChild(aSave);

    var aStop = document.createElement('a');
    aStop.id = "stopAnnotationsA";
    aStop.href = "javascript:void(0);";
    aStop.className = "icon";
    aStop.title = "Stop";
    aStop.style = "display: none";
    aStop.addEventListener("click", stopAnnotationsSections, false);
    var stopIcon = document.createElement("i");
    stopIcon.className = "fa fa-stop fa-2x fa-border";
    stopIcon.style="background-color: white;";
    aStop.appendChild(stopIcon);
    menuAnnotationsLinkDiv.appendChild(aStop);

    var aUndo = document.createElement('a');
    aUndo.id = "undoAnnotationsA";
    aUndo.href = "javascript:void(0);";
    aUndo.className = "icon";
    aUndo.title = "Undo";
    aUndo.style = "display: none";
    aUndo.addEventListener("click", undoAnnotationsSections, false);
    var undoIcon = document.createElement("i");
    undoIcon.className = "fa fa-undo fa-2x fa-border";
    undoIcon.style="background-color: white;";
    aUndo.appendChild(undoIcon);
    menuAnnotationsLinkDiv.appendChild(aUndo);

    menuAnnotationsLinkDiv.appendChild(menuAnnotationsLink);
    divMenuAnnotations.appendChild(menuAnnotationsLinkDiv);

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

    for(var annotationsIndex = 0; annotationsIndex < annotations.length; annotationsIndex++){
        var a2 = document.createElement('a');
        a2.id = annotations[annotationsIndex].id;
        //a2.href = '';
        a2.addEventListener("click", function(){
            for(var i = 0; i < annotations.length; i++){
                if(annotations[i].id === this.id){
                    annotations[i].start();
                }
            }
        }, false);
        a2.text = annotations[annotationsIndex].name;
        divAnnotationsMenu.appendChild(a2);

        var a2b = document.createElement('a');
        a2b.id = "reset" + annotations[annotationsIndex].id;
        a2b.className = "icon";
        a2b.title = "Reset" + annotations[annotationsIndex].name;
        a2b.addEventListener("click", function(){
            for(var i = 0; i < annotations.length; i++){
                if(annotations[i].id === this.id.split("reset").join("")){
                    annotations[i].reset();
                }
            }
        }, false);
        var a2bIcon = document.createElement("i");
        a2bIcon.className = "fa fa-trash-o";
        a2bIcon.style = "margin-left: 8px";
        a2b.appendChild(a2bIcon);
        divAnnotationsMenu.appendChild(a2b);

        divAnnotationsMenu.appendChild(document.createElement('br'));
    }

    var a7 = document.createElement('a');
    a7.id = "loadAnnotationsA";
    a7.text = "Load annotations";
    a7.addEventListener("click", loadAnnotationsFromServer, false);
    divAnnotationsMenu.appendChild(a7);
    divAnnotationsMenu.appendChild(document.createElement('br'));

    var a8 = document.createElement('a');
    a8.id = "saveAnnotationsA";
    a8.text = "Save annotations";
    a8.addEventListener("click", saveAnnotationsFromServer, false);
    divAnnotationsMenu.appendChild(a8);
    divAnnotationsMenu.appendChild(document.createElement('br'));


    var divLoadAnnotations = document.createElement('div')
    divLoadAnnotations.id = "menu-loadAnnotations"
    divLoadAnnotations.style = "z-index: 100; padding: 10px; border: 2px solid black; display: none; background-color: white"

    var iLoad = document.createElement('i');
    iLoad.className = 'fa fa-close'
    iLoad.style = "position: absolute; right: 1%; top: 91%; z-index: 100;"
    iLoad.addEventListener("click", function(){
        closeLoadMenu();
    }, false);
    divLoadAnnotations.appendChild(iLoad);

    divMenuAnnotations.appendChild(divAnnotationsMenu);
    divMenuAnnotations.appendChild(divLoadAnnotations);

    document.body.appendChild(divMenuAnnotations);

}



function saveAnnotationsSections(){

    if(annotationActive){
        for(var i = 0; i < annotations.length; i++){
            if(annotationId === annotations[i].id){
                annotations[i].save();
            }
        }
    }
}

function stopAnnotationsSections(){

    if(annotationActive){
        for(var i = 0; i < annotations.length; i++){
            if(annotationId === annotations[i].id){
                annotations[i].stop();
            }
        }
    }
}

function undoAnnotationsSections(){

    if(annotationActive){
        for(var i = 0; i < annotations.length; i++){
            if(annotationId === annotations[i].id){
                annotations[i].undo();
            }
        }
    }
}

function resetAnnotationsSections(){

    if(annotationActive){
        for(var i = 0; i < annotations.length; i++){
            if(annotationId === annotations[i].id){
                annotations[i].reset();
            }
        }
    }
}

function startAnnotations(annotation){
    if(annotation.domElements.length === 1 && annotation.domElements[0] === "text"){
        startAnnotationsTextSections();
    } else {
        annotationElements = annotation.domElements;
        startAnnotationsElements();
    }
}

function startAnnotationsTextSections(){
    activateTextDetector = true;
    closeAnnotationsMenu();

    showAnnotationsButtons();
    hideAnnotationMainButton();

    var textSelectionDiv
    //annotationActive = true;
    //annotationId = annotation.id;
    annotatedItemsAux = [];
    document.addEventListener("mouseup", saveTextSelected);
    document.addEventListener("keyup", saveTextSelected);
    //document.getElementById("annotateTextA").text = "Save text section";
    textSelectionDiv = document.createElement("div");
    textSelectionDiv.id = "textSelectionDiv";
    textSelectionDiv.style = "position: fixed; top: 80%; margin: 10px; padding: 10px; width: 95%; height: 100px; overflow: scroll; background-color: #E6E6E6; border: 1px solid #00000F; display: none";
    document.body.appendChild(textSelectionDiv);
    alert("Please select text from a specific section with important information and then click the save icon.");

}

function startAnnotationsElements(){
    activateClickDetector = true;
    annotationActive = true;
    closeAnnotationsMenu();

    showAnnotationsButtons();
    hideAnnotationMainButton();

    $('button').attr('disabled', 'disabled');
    $('a').addClass("hideSectionsLinks");
    /*all = document.body.getElementsByTagName("*");
        for (var i = 0; i < all.length; i++) {
            all[i].classList.add('hoverColor');
        }*/
    //$('a').css({'pointer-events': 'none'});
    $("#saveAnnotationsA").css({'pointer-events': 'all'});
    $("#stopAnnotationsA").css({'pointer-events': 'all'});
    $("#undoAnnotationsA").css({'pointer-events': 'all'});
    annotatedItemsAux = [];
    alert("Please click on the elements from a specific section and then click the save icon.");
}

function saveAnnotations(annotation){
    if(annotation.domElements.length === 1 && annotation.domElements[0] === "text"){
        saveAnnotationsTextSections();
    } else {
        saveAnnotationsElements();
    }
}

function saveAnnotationsTextSections(){
    if(Array.isArray(annotatedItemsAux) && annotatedItemsAux.length > 0){
        var result = prompt("Title of these text selections", "");
        var jsonText = new Object();
        jsonText.name = result;
        jsonText.value = annotatedItemsAux;
        var jsons = new Array();
        try{
            var items = JSON.parse(myStorage.getItem(localStoragePrefix + annotationId));
            if(Array.isArray(items) && items.length > 0){
                jsons = items;
            }
        } catch(e){}
        jsons.push(jsonText);
        myStorage.setItem(localStoragePrefix + annotationId, JSON.stringify(jsons));
        annotatedItemsAux = [];

        var textSelectionDiv = document.getElementById("textSelectionDiv");
        textSelectionDiv.innerHTML = "";
    }

    if(annotationActive){
        alert("Please continue selecting text from other specific section (until you click the stop icon).");
    }
}

function saveAnnotationsElements(){
    if(Array.isArray(annotatedItemsAux) && annotatedItemsAux.length > 0){
        var result = prompt("Title of this section", "");
        if(result !== null){
            var all = document.body.getElementsByTagName("*");
            for (var j = 0; j < all.length; j++) {
                all[j].classList.remove('hoverColor');
                all[j].classList.remove('selectedColor');
            }

            $('*[class=""]').removeAttr('class');

            var jsonParagraph = new Object();
            jsonParagraph.name = result;
            jsonParagraph.value = annotatedItemsAux;
            var jsons = new Array();
            try{
                var items = JSON.parse(myStorage.getItem(localStoragePrefix + annotationId));
                if(Array.isArray(items) && items.length > 0){
                    jsons = items;
                }
            } catch(e){}
            jsons.push(jsonParagraph);
            myStorage.setItem(localStoragePrefix + annotationId, JSON.stringify(jsons));
            annotatedItemsAux = [];

            //TODO: refactor xpath annotations
            if(annotationId === "paragraphAnnotation"){
                var jsonParagraphXPath = new Object();
                jsonParagraphXPath.name = result;
                jsonParagraphXPath.value = paragraphItemsXPathAux;
                var jsonsXPath = new Array();
                try{
                    var paragraphItemsXPath = JSON.parse(myStorage.getItem(localStoragePrefix + "paragraphItemsXPath"));
                    if(Array.isArray(paragraphItemsXPath) && paragraphItemsXPath.length > 0){
                        jsonsXPath = paragraphItemsXPath;
                    }
                } catch(e){}
                jsonsXPath.push(jsonParagraphXPath);
                myStorage.setItem(localStoragePrefix + "paragraphItemsXPath", JSON.stringify(jsonsXPath));
                paragraphItemsXPathAux = [];
            }

            if(annotationActive){
                alert("Please continue clicking on other sections (until you click the stop icon).");
            }
        }
    }
}


function stopAnnotations(annotation){
    if(annotation.domElements.length === 1 && annotation.domElements[0] === "text"){
        stopAnnotationsTextSections();
    } else {
        stopAnnotationsElements();
    }
}

function stopAnnotationsTextSections(){
    if(activateTextDetector){
        document.removeEventListener("mouseup", saveTextSelected);
        document.removeEventListener("keyup", saveTextSelected);

        annotationActive = false;
        saveAnnotationsTextSections();
        annotationId = "";
        activateTextDetector = false;

        hideAnnotationsButtons();
        showAnnotationMainButton();

        var textSelectionDiv = document.getElementById("textSelectionDiv");
        document.body.removeChild(textSelectionDiv);

        toggleReadAloud();

        for(var i = 0; i < operations.length; i++){
            if(operations[i].hasMenu){
                updateSubmenuForOperationAndAnnotations("menu-" + operations[i].id, operations[i], operations[i].annotations);
            }
        }

        toggleHiddenSections();

    }
}

function stopAnnotationsElements(){
    annotationActive = false;
    saveAnnotationsElements()
    $('button').removeAttr('disabled');
    //$('a').css({'pointer-events': 'all'});
    $('a').removeClass("hideSectionsLinks");
    activateClickDetector = false;
    $('*[class=""]').removeAttr('class');

    // save sections names from paragraphItems
    /*var paragraphItems = JSON.parse(myStorage.getItem(localStoragePrefix + "paragraphItems"));
    var textItems = JSON.parse(myStorage.getItem(localStoragePrefix + "textItems"));
    var sectionsNames = [];
    for(var i = 0; i < paragraphItems.length; i++){
        sectionsNames.push(paragraphItems[i].name);
    }
    for(var j = 0; j < textItems.length; j++){
        sectionsNames.push(textItems[j].name);
    }
    myStorage.setItem(localStoragePrefix + "sectionsNames", JSON.stringify(sectionsNames));*/

    hideAnnotationsButtons();
    showAnnotationMainButton();

    updateScriptXPath();
    toggleReadAloud();

    for(var i = 0; i < operations.length; i++){
        if(operations[i].hasMenu){
            updateSubmenuForOperationAndAnnotations("menu-" + operations[i].id, operations[i], operations[i].annotations);
        }
    }

    toggleHiddenSections();
}

function undoAnnotations(annotation){
    if(annotation.domElements.length === 1 && annotation.domElements[0] === "text"){
        undoAnnotationsTextSections();
    } else {
        undoAnnotationsElements();
    }
}

function undoAnnotationsTextSections(){
    annotatedItemsAux.pop();

    var newContentString = "";
    for(var i = 0; i < annotatedItemsAux.length; i++){
        newContentString += annotatedItemsAux[i] + " ";
    }
    var textSelectionDiv = document.getElementById("textSelectionDiv");
    textSelectionDiv.innerText = newContentString;
}

function undoAnnotationsElements(){

    try{
        var lastItem = getElementByXPath(annotatedItemsAux[annotatedItemsAux.length -1]);
        if(typeof lastItem !== "undefined" && lastItem !== null){
            lastItem.classList.remove('selectedColor');
            annotatedItemsAux.pop();
            if(annotationId === "paragraphAnnotation")
                paragraphItemsXPathAux.pop();
        }/* else {
            var all = document.body.getElementsByTagName("*");
            for (var j=0, max=all.length; j < max; j++) {
                var containsSelectedColor = false;
                if(all[j].classList.contains('selectedColor')){
                    all[j].classList.remove('selectedColor');
                    if(all[j].classList.length === 0){
                        all[j].removeAttribute('class');
                    }
                    containsSelectedColor = true;
                }
                if(all[j].outerHTML === annotatedItemsAux[annotatedItemsAux.length -1]){
                    all[j].classList.remove('selectedColor');
                    annotatedItemsAux.pop();
                    if(annotationId === "paragraphAnnotation")
                        paragraphItemsXPathAux.pop();
                    containsSelectedColor = false;
                }

                if(containsSelectedColor){
                    all[j].classList.add('selectedColor');
                    containsSelectedColor = false;
                }
            }
        }*/
    } catch(error){
        console.log("Error searching for undo");
        console.log(error.message);
    }
}

function resetAnnotationsById(id){

    //remove text selections
    //annotatedItems = [];
    myStorage.setItem(localStoragePrefix + id, JSON.stringify([]));
    closeAnnotationsMenu();

    for(var i = 0; i < operations.length; i++){
        if(operations[i].hasMenu){
            updateSubmenuForOperationAndAnnotations("menu-" + operations[i].id, operations[i], operations[i].annotations);
        }
    }

    toggleHiddenSections();
}

function clickDetector(){
    document.addEventListener('click', function(event) {
        if (event===undefined) event= window.event;
        var target= 'target' in event? event.target : event.srcElement;

        if(activateClickDetector){
            var menu = document.getElementById("menu-webaugmentation");
            var menuAnnotations = document.getElementById("menu-intermediary");
            if(!menu.contains(target) && !menuAnnotations.contains(target)){
                console.log('clicked on ' + target.tagName);
                for(var i = 0; i < annotationElements.length; i++){
                    if(target.tagName === annotationElements[i] || annotationElements[i] === "all"){
                        annotatedItemsAux.push(getXPathForElement(target));
                        target.classList.add('selectedColor');
                        if(annotationId === "paragraphAnnotation"){
                            paragraphItemsXPathAux.push(getXPathForElement(target))
                        }
                    }
                }
            }
            event.stopPropagation()
            event.preventDefault()
            return false;
        }
    }, false);
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

function saveTextSelected() {
    var selectedText = getSelectedText();
    console.log(selectedText);
    if (selectedText && !annotatedItemsAux.includes(selectedText)) {
        annotatedItemsAux.push(selectedText);

        var newContent = document.createTextNode(selectedText + " ");
        var textSelectionDiv = document.getElementById("textSelectionDiv");
        textSelectionDiv.appendChild(newContent);
        textSelectionDiv.style.display = "block";
    }
    clearTextSelected();
}

function clearTextSelected() {
    if (window.getSelection) {
        if (window.getSelection().empty) {  // Chrome
            window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {  // Firefox
            window.getSelection().removeAllRanges();
        }
    } else if (document.selection) {  // IE?
        document.selection.empty();
    }
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

    for(var operationsIndex = 0; operationsIndex < operations.length; operationsIndex++){
        var a = document.createElement('a');
        a.id = operations[operationsIndex].id;
        //a.href = '';
        a.text = operations[operationsIndex].name;
        operations[operationsIndex].configureOperation();
        if(operations[operationsIndex].hasMenu){
            a.addEventListener("click", operations[operationsIndex].openMenu, false);
        } else {
            a.addEventListener("click", operations[operationsIndex].startOperation, false);
        }
        divButtons.appendChild(a);

        if(operations[operationsIndex].activable){
            var input = document.createElement('input');
            input.type = 'checkbox';
            input.id = operations[operationsIndex].id + "Input";
            input.value = operations[operationsIndex].id + "Input";
            input.checked = operations[operationsIndex].active;
            if(operations[operationsIndex].active){
                a.style.setProperty("pointer-events", "all");
            } else {
                a.style.setProperty("pointer-events", "none");
            }
            input.addEventListener("change", function(){
                for(var operationsI = 0; operationsI < operations.length; operationsI++){
                    if(operations[operationsI].id === this.id.split("Input").join("")){
                        if(!this.checked){
                            operations[operationsI].active = false;
                            myStorage.setItem(localStoragePrefix + operations[operationsI].id + "Active", operations[operationsI].active);
                            document.getElementById(operations[operationsI].id).style.setProperty("pointer-events", "none");
                            if(this.id.split("Input").join("") === "readAloud"){
                                toggleReadAloud();
                            } else if(this.id.split("Input").join("") === "videos"){
                                toggleYoutubeVideos();
                            } else if(this.id.split("Input").join("") === "breadcrumb"){
                                toggleBreadcrumb();
                            } else if(this.id.split("Input").join("") === "hide"){
                                toggleHiddenSections();
                            }
                        } else {
                            operations[operationsI].active = true;
                            myStorage.setItem(localStoragePrefix + operations[operationsI].id + "Active", operations[operationsI].active);
                            document.getElementById(operations[operationsI].id).style.setProperty("pointer-events", "all");
                            if(this.id.split("Input").join("") === "readAloud"){
                                toggleReadAloud();
                            } else if(this.id.split("Input").join("") === "videos"){
                                toggleYoutubeVideos();
                            } else if(this.id.split("Input").join("") === "breadcrumb"){
                                toggleBreadcrumb();
                            } else if(this.id.split("Input").join("") === "hide"){
                                toggleHiddenSections();
                            }
                        }
                    }
                }
            }, false);
            divButtons.appendChild(input);
        }
        divButtons.appendChild(document.createElement('br'));
    }
    document.getElementById("div-webaugmentation").appendChild(divButtons);

    /*  createReadMenu();
        createGoToMenu();*/
    createSpeakableAnnotations();
    if(listeningActive){
        readWelcome();
    }

    //TODO: refactor Toggle some operations
    toggleYoutubeVideos();
    toggleReadAloud();
    toggleBreadcrumb();
    toggleHiddenSections();
}


function createCommandsMenu(){
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

    for(var index = 0; index < operations.length; index++){
        var a1 = document.createElement('a');
        a1.id = operations[index].id + "Edit";
        a1.text = "'" + operations[index].name + "' command " + "(" + operations[index].voiceCommand + ") ";
        a1.addEventListener("click", function(){
            for(var index = 0; index < operations.length; index++){
                if(operations[index].id === this.id.split("Edit").join("")){
                    var result = prompt("New command value for '" + operations[index].name + "' command", operations[index].voiceCommand);
                    if(result !== null){
                        operations[index].voiceCommand = result.toLowerCase();
                        myStorage.setItem(localStoragePrefix + operations[index].id, result.toLowerCase());
                        console.log(result);
                    }
                }
            }
        }, false);
        var a1i = document.createElement('i');
        a1i.className = 'fa fa-edit'
        a1.appendChild(a1i);
        divCommandsMenu.appendChild(a1);
        divCommandsMenu.appendChild(document.createElement('br'));
    }

    document.getElementById("div-webaugmentation").appendChild(divCommandsMenu);
}


function createSubmenuForOperationAndAnnotations(menuId, operationForSubmenu){

    var annotationsForSubmenu = operationForSubmenu.annotations;
    var divSubMenu = document.createElement("div");
    divSubMenu.id = menuId;
    divSubMenu.style = "z-index: 100; padding: 10px; border: 2px solid black; display: none; background-color: white";

    var i = document.createElement('i');
    i.className = 'fa fa-close';
    i.style = "position: absolute; right: 1%; top: 31%; z-index: 100;";
    i.addEventListener("click", closeSubmenu, false);
    i.menuId = menuId;
    divSubMenu.appendChild(i);

    try{
        for(var annotationsForSubmenuIndex = 0; annotationsForSubmenuIndex < annotationsForSubmenu.length; annotationsForSubmenuIndex++){
            for(var annotationsIndex = 0; annotationsIndex < annotations.length; annotationsIndex++){
                if(annotationsForSubmenu[annotationsForSubmenuIndex] === annotations[annotationsIndex].id){
                    var annotationItems = myStorage.getItem(localStoragePrefix + annotations[annotationsIndex].id);
                    annotations[annotationsIndex].items = JSON.parse(annotationItems);
                    var items = annotations[annotationsIndex].items
                    for(var sectionsIndex = 0; sectionsIndex < items.length; sectionsIndex ++){
                        var a1 = document.createElement('a');
                        a1.text = items[sectionsIndex].name
                        var sectionName = items[sectionsIndex].name
                        a1.addEventListener("click", operationForSubmenu.startOperation, false);
                        a1.sectionName = items[sectionsIndex].name;
                        a1.operation = operationForSubmenu;
                        divSubMenu.appendChild(a1);
                        divSubMenu.appendChild(document.createElement('br'));
                    }
                }
            }
        }
    } catch(e){}

    document.getElementById("div-webaugmentation").appendChild(divSubMenu);
}

function updateSubmenuForOperationAndAnnotations(menuId, operationForSubmenu, annotationsForSubmenu){

    var divSubMenu = document.getElementById(menuId);
    while (divSubMenu.firstChild) {
        divSubMenu.removeChild(divSubMenu.firstChild);
    }
    //divSubMenu.innerHTML = "";


    var i = document.createElement('i');
    i.className = 'fa fa-close';
    i.style = "position: absolute; right: 1%; top: 31%; z-index: 100;";
    i.addEventListener("click", closeSubmenu, false);
    i.menuId = menuId;
    divSubMenu.appendChild(i);

    try{
        for(var annotationsForSubmenuIndex = 0; annotationsForSubmenuIndex < annotationsForSubmenu.length; annotationsForSubmenuIndex++){
            for(var annotationsIndex = 0; annotationsIndex < annotations.length; annotationsIndex++){
                if(annotationsForSubmenu[annotationsForSubmenuIndex] === annotations[annotationsIndex].id){
                    var annotationItems = myStorage.getItem(localStoragePrefix + annotations[annotationsIndex].id);
                    annotations[annotationsIndex].items = JSON.parse(annotationItems);
                    var items = annotations[annotationsIndex].items
                    for(var sectionsIndex = 0; sectionsIndex < items.length; sectionsIndex ++){
                        var a1 = document.createElement('a');
                        a1.text = items[sectionsIndex].name
                        var sectionName = items[sectionsIndex].name
                        a1.addEventListener("click", operationForSubmenu.startOperation, false);
                        a1.sectionName = items[sectionsIndex].name;
                        a1.operation = operationForSubmenu;
                        divSubMenu.appendChild(a1);
                        divSubMenu.appendChild(document.createElement('br'));
                    }
                }
            }
        }
    } catch(e){}

    document.getElementById("div-webaugmentation").appendChild(divSubMenu);
}

function showSubmenu(id){
    var divSubMenu = document.getElementById(id);
    if(divSubMenu !== null){
        var x = divSubMenu.style;
        x.display = "block";
    }
}

function closeSubmenu(menuId){
    var menuIdToClose = menuId;
    if(typeof menuId.parentElement === 'undefined' && typeof menuId.currentTarget !== 'undefined'){
        menuIdToClose = menuId.currentTarget.menuId
    }
    var divSubMenu = document.getElementById(menuIdToClose);
    if(divSubMenu !== null){
        var x = divSubMenu.style;
        x.display = "none";
    }
}


function readWelcome(){
    var readContent = "Welcome to " + document.title + "! The voice commands available are: ";
    for(var i = 0; i < operations.length; i++){
        readContent += operations[i].name + ", ";
    }
    readContent += listOperationsCommand + ", " + listSectionsCommand + ", " + welcomeCommand + ", " + stopListeningCommand + ", " + changeCommand;
    Read(readContent);
}

function readOperations(){
    var readContent = "The voice commands available are: ";
    for(var i = 0; i < operations.length; i++){
        readContent += operations[i].name + ", ";
    }
    
    readContent += listOperationsCommand + ", " + listSectionsCommand + ", " + welcomeCommand + ", " + stopListeningCommand + ", " + changeCommand;
    Read(readContent);
}

function readSections(){
    var readContent = "The sections of the website are: ";
    for(var i = 0; i < operations.length; i++){
        for(var j = 0; j < operations[i].annotations.length; j++){
            var items = JSON.parse(myStorage.getItem(localStoragePrefix + operations[i].annotations[j]));
            for(var k = 0; k < items.length; k++){
                readContent += items[k].name + ", ";
            }
        }
    }

    Read(readContent);
}

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

function toggleReadAloud(){
    var divsToHide = document.getElementsByClassName("readAloudButton");
    var readCommandActive;
    if(!document.getElementById("readAloudInput").checked){
        readCommandActive = false;
        document.getElementById("readAloud").style.setProperty("pointer-events", "none");
        for(var i = 0; i < divsToHide.length; i++){
            divsToHide[i].style.display = "none";
        }
    } else {
        readCommandActive = true;
        document.getElementById("readAloud").style.setProperty("pointer-events", "all");
        for(var i2 = 0; i2 < divsToHide.length; i2++){
            divsToHide[i2].style.display = "block";
        }
    }
    myStorage.setItem(localStoragePrefix + "readAloudActive", readCommandActive);
}

function resumeInfinity() {
    reading = true;
    window.speechSynthesis.pause();
    window.speechSynthesis.resume();
    timeoutResumeInfinity = setTimeout(resumeInfinity, 10000);
    $('#cancel').css('visibility', 'visible');
}

function Read(message){
    //console.log("Read function: " + message)
    window.speechSynthesis.cancel();
    clearTimeout(timeoutResumeInfinity);
    var reader = new SpeechSynthesisUtterance(message);
    reader.rate = 0.75;
    reader.lang = languageCodeSyntesis;
    reader.onstart = function(event) {
        resumeInfinity();
    };
    reader.onend = function(event) {
        reading = false;
        clearTimeout(timeoutResumeInfinity);
        $('#cancel').css('visibility', 'hidden');
    };


    var hiddenButton = document.createElement("button");
    hiddenButton.style.display = "none";
    document.body.appendChild(hiddenButton);
    hiddenButton.click();

    try{
        reading = true;
        /*if(recognitionActive){
            recognition.abort();
        }*/
        window.speechSynthesis.speak(reader);
    } catch(e){}
    $('#cancel').css('visibility', 'visible');
}

function stopReading(){
    reading = false;
    window.speechSynthesis.cancel();
    clearTimeout(timeoutResumeInfinity);
    $('#cancel').css('visibility', 'hidden');
}

function KeyPress(e) {
    var evtobj = window.event? event : e

    if (evtobj.keyCode == 32 && evtobj.ctrlKey){
        if(reading){
            stopReading();
        }
        else if(!listeningActive && !recognitionActive){
            recognition.start();
            recognitionActive = true;
            var aToggleListening = document.getElementById("toggleListeningA");
            aToggleListening.text = 'Stop Listening';
            listeningActive = true;
            var inputVoiceCommands = document.getElementById("voiceCommandsInput");
            inputVoiceCommands.checked = listeningActive;
            var toggleListeningIcon = document.getElementById("toggleListeningIcon");
            toggleListeningIcon.style = "color:gray; margin-left: 8px";
            Read("Listening active, to stop listening use the " + stopListeningCommand + " voice command to disable all voice commands.");
        }
    }
}

// Speech recognition
function audioToText(){
    //headlines = document.getElementsByClassName("mw-headline")
    //sectionsNames = JSON.parse(myStorage.getItem(localStoragePrefix + "sectionsNames"));

    updateGrammar();
    recognition.lang = languageCodeCommands;
    recognition.interimResults = false;
    recognition.continuous = true;

    recognition.onresult = event => {
        if(reading === false) {
            const speechToText = event.results[event.results.length -1][0].transcript.toLowerCase();
            console.log(speechToText);
            if(!changeCommandInProcess1 && !changeCommandInProcess2){
                if(speechToText.includes(listOperationsCommand)){
                    readOperations();
                }
                else if(speechToText.includes(welcomeCommand)){
                    readWelcome();
                }
                else if(speechToText.includes(listSectionsCommand)|| speechToText.includes(listSectionCommand)){
                    readSections();
                }
                else if(speechToText.includes(changeCommand)){
                    console.log("changeCommandInProcess = true")
                    changeCommandInProcess1 = true;
                    Read(changeCommandQuestion + "?");
                }
                else if(speechToText.includes(stopListeningCommand)){
                    if(recognitionActive){
                        console.log("recognition deactivated")
                        recognitionActive = false;
                        recognition.abort();
                    }
                    listeningActive = false;
                    document.getElementById("toggleListeningA").text = "Start Listening";
                    document.getElementById("toggleListeningIcon").style = "color:red";
                    Read("Listening stopped, to start listening use control and space keys.");
                } else {
                    for(var i = 0; i < operations.length; i++){
                        if(speechToText.includes(operations[i].voiceCommand) && operations[i].active){
                            if(operations[i].annotations.length > 0) {
                                for(var j = 0; j < operations[i].annotations.length; j++){
                                    var items = JSON.parse(myStorage.getItem(localStoragePrefix + operations[i].annotations[j]));
                                    for(var k = 0; k < items.length; k++){
                                        if(speechToText.includes(operations[i].voiceCommand + " " + items[k].name) && operations[i].active){
                                            var params = {};
                                            var current = {};
                                            params.currentTarget = current;
                                            params.currentTarget.sectionName = items[k].name;
                                            params.currentTarget.operation = operations[i];
                                            operations[i].startOperation(params);
                                            return;
                                        }
                                    }
                                }
                            } else {
                                operations[i].startOperation();
                                return;
                            }
                        }
                    }
                    if(recognitionFailedFirstTime){
                        recognitionFailedFirstTime = false;
                        Read(recognitionFailedText + " Use " + listOperationsCommand + " to know which operations are available and "
                             + listSectionsCommand + " to know which sections can be read aloud.");
                    } else {
                        Read(recognitionFailedText);
                    }
                }
            } else {
                if(changeCommandInProcess1){
                    //Command change in process
                    if(!speechToText.includes(changeCommandQuestion) && !speechToText.includes(newCommandQuestion)){
                        if(speechToText.toLowerCase() == cancelCommand) {
                            console.log("Cancel change of command")
                            changeCommandInProcess1 = false;
                            changeCommandInProcess2 = false;
                            return;
                        }
                        for(var opIndex = 0; opIndex < operations.length; opIndex++){
                            if(speechToText.includes(operations[opIndex].voiceCommand)){
                                Read(newCommandQuestion + "?");
                                newCommandString = speechToText.toLowerCase();
                                operationToChange = operations[opIndex];
                                changeCommandInProcess1 = false;
                                changeCommandInProcess2 = true;
                                return;
                            }
                        }

                        Read(speechToText + " is not an existing command. Try again.");
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
                            myStorage.setItem(localStoragePrefix + operationToChange.id, speechToText.toLowerCase());
                            operationToChange.voiceCommand = speechToText.toLowerCase();
                            //console.log("new variable value " + eval(camelize(newCommandString) + "Command"))
                            changeCommandInProcess1 = false;
                            changeCommandInProcess2 = false;
                        }
                    }
                }
            }
        }
    }

    /*recognition.onend = event => {
        if(listeningActive && !reading){
            recognition.start();
        } else {
            recognitionActive = false;
            listeningActive = false;
        }
    }*/
    /*recognition.onstart = event => {
        recognitionActive = true;
        listeningActive = true;
    }*/

    if(listeningActive && !recognitionActive){
        recognition.start();
        recognitionActive = true;
        console.log("recognition activated")
    }
}

function updateGrammar(){

    var commandsGrammar = [ 'increase', 'magnify', 'read', 'play', 'font', 'size', 'decrease', 'reduce', 'stop', 'listening'];
    var commandsAux = [];
    for(var i = 0; i < operations.length; i++){
        //TODO: add operation + annotations names to grammar
        /*if(operations[i].voiceCommand === "read" || operations[i].voiceCommand === "go to"){
            for(var j = 0; j < sectionsNames.length; j++){
                commandsAux.push(operations[i] + " " + sectionsNames[j].toLowerCase())
            }
        } else {*/
            commandsAux.push(operations[i].voiceCommand)
        //}
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
    var videosCommandActive = myStorage.getItem(localStoragePrefix + "videosActive");
    closeOperationsMenu();
    closeMenu();

    if(videosCommandActive){
        $(window).scrollTop($('#youtubeVideos').offset().top);
    }
}

function toggleYoutubeVideos(){
    var x = document.getElementById("youtubeVideos");
    var videosCommandActive;
    if (!document.getElementById("videosInput").checked) {
        if(x !== null){
            x.style.display = "none";
        }
        document.getElementById("videos").style.setProperty("pointer-events", "none");
        videosCommandActive = false;
    } else {
        if(x !== null){
            x.style.display = "block";
        } else {
            youtubeVideos();
        }
        document.getElementById("videos").style.setProperty("pointer-events", "all");
        videosCommandActive = true;
    }
    myStorage.setItem(localStoragePrefix + "videosActive", videosCommandActive);
}


// Bread Crumb (History)
function breadcrumb(){
    var lastVisitedSitesURL = []
    var lastVisitedSitesTitle = []
    var breadcrumb = document.createElement('ol');
    breadcrumb.id = "BreadCrumb";
    breadcrumb.setAttribute('vocab',"https://schema.org/");
    breadcrumb.setAttribute('typeof',"BreadcrumbList");

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
    $('#BreadCrumb').css({
        'position': 'fixed',
        'height': '50px',
        'left': '15%',
        'top': '0',
        //'width': '100%',
        'padding': '10px',
        'background-color': '#FFFFFF',
        'vertical-align': 'bottom',
        'visibility': 'visible',
        'border': 'solid black',
        'z-index': '100'
    });
    var lastVisitedSitesURLReverse = lastVisitedSitesURL.reverse()
    var lastVisitedSitesTitleReverse = lastVisitedSitesTitle.reverse()
    for(var x = 0; x < lastVisitedSitesURLReverse.length; x++){
        var li = document.createElement("li");
        li.setAttribute('property',"itemListElement");
        li.setAttribute('typeof',"ListItem");
        li.style.display = "inline";

        var link = document.createElement("a");
        if(x < lastVisitedSitesURLReverse.length - 1) {
            link.href = lastVisitedSitesURLReverse[x];
            link.style = "color: #0645ad !important;"
        } else {
            link.style = "color: #000000 !important;text-decoration: none;"
        }
        link.setAttribute('property',"item");
        link.setAttribute('typeof',"WebPage");
        link.className = "linkBread";
        var span = document.createElement("span");
        span.setAttribute('property',"name");
        span.innerText = lastVisitedSitesTitleReverse[x];
        var meta = document.createElement("meta");
        meta.setAttribute('property',"position");
        var position = x+1;
        meta.setAttribute('content',position+"");
        link.appendChild(span);
        li.appendChild(link);
        li.appendChild(meta);
        breadcrumb.appendChild(li);
        breadcrumb.innerHTML += " > ";
    }
    $('.linkBread').each(function(){
        $(this).css({
            'padding':'3px',
        });
    });

    //toggleBreadcrumb()
}


function toggleBreadcrumb(){
    var breadcrumbCommandActive;
    if(document.getElementById("breadcrumbInput").checked){
        breadcrumbCommandActive = true;
        document.getElementById("BreadCrumb").style.setProperty("display", "block");
    } else {
        breadcrumbCommandActive = false;
        document.getElementById("BreadCrumb").style.setProperty("display", "none");
    }
    myStorage.setItem(localStoragePrefix + "breadcrumbActive", breadcrumbCommandActive);
}

function toggleHiddenSections(){
    console.log("toggleHiddenSections");
    var hiddenSectionsCommandActive;
    //$('.readAloudButton').attr('disabled', 'disabled');
    try{
        var hiddenItems = JSON.parse(myStorage.getItem(localStoragePrefix + "uselessAnnotation"));
        if(hiddenItems !== null){
            for(var i = 0; i < hiddenItems.length; i++){
                for(var j = 0; j < hiddenItems[i].value.length; j++){
                        var element = getElementByXPath(hiddenItems[i].value[j]);
                    if (document.getElementById("hideInput").checked) {
                        element.classList.add("hideUselessSections");
                        hiddenSectionsCommandActive = true;
                    } else {
                        element.classList.remove("hideUselessSections");
                        hiddenSectionsCommandActive = false;
                    }
                }
            }
        }

        myStorage.setItem(localStoragePrefix + "hideActive", hiddenSectionsCommandActive);

        closeMenu();
        closeOperationsMenu();
    } catch(e){

    }
    //$('.readAloudButton').removeAttr('disabled');

}


function toggleMenu(){
    var x = document.getElementById("foldingMenu");
    if(x !== null){
        if (x.style.display === "block") {
            x.style.display = "none";
        } else {
            x.style.display = "block";
        }
        closeCommandsMenu();
        closeAnnotationsMenu();
        closeOperationsMenu();
    }
}
function closeMenu(){
    var x = document.getElementById("foldingMenu");
    if(x !== null){
        x.style.display = "none";
    }
}

function toggleOperationsMenu(){
    var x = document.getElementById("menu-operations");
    if(x !== null){
        if (x.style.display === "block") {
            x.style.display = "none";
        } else {
            x.style.display = "block";
            closeMenu();
        }
    }
}
function closeOperationsMenu(){
    var x = document.getElementById("menu-operations");
    if(x !== null){
        x.style.display = "none";
    }
}

function toggleAnnotationsMenu(){
    var x = document.getElementById("menu-annotations");
    if(x !== null){
        if (x.style.display === "block") {
            x.style.display = "none";
        } else {
            x.style.display = "block";
            closeMenu();
            closeOperationsMenu();
        }
    }
}
function closeAnnotationsMenu(){
    var x = document.getElementById("menu-annotations");
    if(x !== null){
        x.style.display = "none";
    }
}

function toggleCommandsMenu(){
    var x = document.getElementById("menu-commands");
    if(x !== null){
        if (x.style.display === "block") {
            x.style.display = "none";
        } else {
            x.style.display = "block";
        }
    }
}
function closeCommandsMenu(){
    var x = document.getElementById("menu-commands");
    if(x !== null){
        x.style.display = "none";
    }
}


function showAnnotationMainButton(){
    var aIntermediary = document.getElementById("a-intermediary");
    aIntermediary.style = "display: block";
}

function showAnnotationsButtons(){

    var aSave = document.getElementById("saveAnnotationsA");
    aSave.style = "display: block";

    var aStop = document.getElementById("stopAnnotationsA");
    aStop.style = "display: block";

    var aUndo = document.getElementById("undoAnnotationsA");
    aUndo.style = "display: block";

}

function hideAnnotationMainButton(){
    var aIntermediary = document.getElementById("a-intermediary");
    aIntermediary.style = "display: none";
}

function hideAnnotationsButtons(){

    var aSave = document.getElementById("saveAnnotationsA");
    aSave.style = "display: none";

    var aStop = document.getElementById("stopAnnotationsA");
    aStop.style = "display: none";

    var aUndo = document.getElementById("undoAnnotationsA");
    aUndo.style = "display: none";

}

/*function saveAnnotationsSections(){

    if(annotationsUselessActive){
        saveAnnotationsUselessSections();
    } else if(annotationsParagraphActive){
        saveAnnotationsParagraphSections();
    } else if(annotationsTextActive){
        saveAnnotationsTextSections();
    }
}

function stopAnnotationsSections(){

    if(annotationsUselessActive){
        //stopAnnotationsUselessSections();
    } else if(annotationsParagraphActive){
        stopAnnotationsParagraphSections();
    } else if(annotationsTextActive){
        stopAnnotationsTextSections();
    }
}

function undoAnnotationsSections(){

    if(annotationsUselessActive){
        undoAnnotationsUselessSections();
    } else if(annotationsParagraphActive){
        undoAnnotationsParagraphSections();
    } else if(annotationsTextActive){
        undoAnnotationsTextSections();
    }
}*/

function loadAnnotationsFromServer(){
    var menuLoadAnnotations = document.getElementById("menu-loadAnnotations");
    menuLoadAnnotations.style.display = "block";
    var xmlhttp = new XMLHttpRequest();
    var url = "https://wake.dlsi.ua.es/AnnotationsServer/?operation=loadWebsite&website="+encodeURI(document.URL);

    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var annotationsLoaded = JSON.parse(this.responseText).results;
            console.log("annotationsLoaded: " + JSON.stringify(annotationsLoaded));
            for(var i = 0; i < annotationsLoaded.length; i++){
                var a = document.createElement('a');
                a.text = annotationsLoaded[i].title;
                a.addEventListener("click", loadAnnotationByTitleAndWebsite, false);
                a.title = annotationsLoaded[i].title;
                menuLoadAnnotations.appendChild(a);
                menuLoadAnnotations.appendChild(document.createElement('br'));
            }
        }
    };

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function closeLoadMenu(){
    document.getElementById("menu-loadAnnotations").style.display = "none";
}

function loadAnnotationByTitleAndWebsite(title){
    var titleToLoad = title;
    if(typeof title.parentElement === 'undefined' && typeof title.currentTarget !== 'undefined'){
        titleToLoad = title.currentTarget.title
    }
    var xmlhttp = new XMLHttpRequest();
    var url = "https://wake.dlsi.ua.es/AnnotationsServer/?operation=loadAnnotation&title="+titleToLoad+"&website="+encodeURI(document.URL);

    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var annotationsLoaded = JSON.parse(this.responseText).results;
            if(annotationsLoaded.length > 0){
                //var annotationsJSON = JSON.parse(annotationsLoaded[0]);
                var annotationsJSON = annotationsLoaded[0];
                //TODO: refactor
                console.log(annotationsJSON);

                for(var annotationsIndex = 0; annotationsIndex < annotations.length; annotationsIndex++){
                    myStorage.setItem(localStoragePrefix + annotations[annotationsIndex].id, annotationsJSON[localStoragePrefix + annotations[annotationsIndex].id]);
                }
                myStorage.setItem(localStoragePrefix + "paragraphItemsXPath", annotationsJSON[localStoragePrefix + "paragraphItemsXPath"]);

                for(var i = 0; i < operations.length; i++){
                    if(operations[i].hasMenu){
                        updateSubmenuForOperationAndAnnotations("menu-" + operations[i].id, operations[i], operations[i].annotations);
                    }
                }
                updateScriptXPath();

                //TODO: toggle operations that are toggleable(?)
                toggleHiddenSections();

                alert("Annotations loaded!");
            }
            //console.log(JSON.stringify(annotationsLoaded));
        }
    };

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function saveAnnotationsFromServer(){
    var result = prompt("Title for annotations", "");
    if(result!=null){
        var annotationsObject = {};
        annotationsObject.title = result;
        annotationsObject.website = encodeURI(document.URL);

        for(var annotationsIndex = 0; annotationsIndex < annotations.length; annotationsIndex++){
            annotationsObject[localStoragePrefix + annotations[annotationsIndex].id] = myStorage.getItem(localStoragePrefix + annotations[annotationsIndex].id);
        }
        annotationsObject[localStoragePrefix + "paragraphItemsXPath"] = myStorage.getItem(localStoragePrefix + "paragraphItemsXPath");
        console.log(JSON.stringify(annotationsObject));
        var xmlhttp = new XMLHttpRequest();
        var url = "https://wake.dlsi.ua.es/AnnotationsServer/";

        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var annotationsSaved = JSON.parse(this.responseText);
                console.log(JSON.stringify(annotationsSaved));
            }
        };

        xmlhttp.open("POST", url, true);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        var params = {}
        params.operation = "save";
        params.annotations = JSON.stringify(annotationsObject);
        //console.log(JSON.stringify(params));
        xmlhttp.send(JSON.stringify(params));
    }
}


function createSpeakableAnnotations(){
    var script = document.createElement('script'); // Create a script element
    script.id = "Annotations";
    script.type = "application/ld+json";
    script.text = '{"@context": "https://schema.org/","@type": "WebPage","name": "' + document.title + '","speakable":{"@type": "SpeakableSpecification","xpath": [';

    var paragraphItemsXPath = JSON.parse(myStorage.getItem(localStoragePrefix + "paragraphItemsXPath"))

    if(paragraphItemsXPath !== null){
        var all
        var added = false;
        for(var i = 0; i < paragraphItemsXPath.length; i++){
            if(typeof paragraphItemsXPath[i].value[0] !== 'undefined'){
                script.text += '"' + paragraphItemsXPath[i].value[0] + '",';
                added = true;
            }
        }
        if(added){
            script.text += script.text.substring(0, script.text.length - 1);
        }
    }
    script.text += ']  }, "url": "' + document.URL + '" }';
    document.body.appendChild(script);
}

function updateScriptXPath(){
    var script = document.getElementById("Annotations");
    script.text = '{"@context": "https://schema.org/","@type": "WebPage","name": "' + document.title + '","speakable":{"@type": "SpeakableSpecification","xpath": [';

    var paragraphItemsXPath = JSON.parse(myStorage.getItem(localStoragePrefix + "paragraphItemsXPath"))

    if(paragraphItemsXPath !== null){
        var all
        var added = false;
        for(var i = 0; i < paragraphItemsXPath.length; i++){
            if(typeof paragraphItemsXPath[i].value[0] !== 'undefined'){
                script.text += '"' + paragraphItemsXPath[i].value[0] + '",';
                added = true;
            }
        }
        if(added){
            script.text += script.text.substring(0, script.text.length - 1);
        }
    }
    script.text += ']  }, "url": "' + document.URL + '" }';
    document.body.appendChild(script);
}

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

function getXPathForElement(element) {
    const idx = (sib, name) => sib
        ? idx(sib.previousElementSibling, name||sib.localName) + (sib.localName == name)
        : 1;
    const segs = elm => !elm || elm.nodeType !== 1
        ? ['']
        : elm.id && document.getElementById(elm.id) === elm
            ? [`id("${elm.id}")`]
            : [...segs(elm.parentNode), `${elm.localName.toLowerCase()}[${idx(elm)}]`];
    return segs(element).join('/').split('"').join("'");
}

function getElementByXPath(path) {
    return (new XPathEvaluator())
        .evaluate(path, document.documentElement, null,
                        XPathResult.FIRST_ORDERED_NODE_TYPE, null)
        .singleNodeValue;
}


/*(function() {
    'use strict';

    // Your code here...
})();*/
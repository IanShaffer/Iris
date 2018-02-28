
// window variables
// content
var block = false;
var WAIT_TIME = 500;
var currentElement;
var lastPlayedElement;
// background
var audio = new Audio();
var googleTextToSpeech = false;
var chosenLanguage = "english";
var languages = {
    english: {
        modelId: undefined,
        voice: "en-US_AllisonVoice"
    },
    spanish: {
        modelId: "en-es-conversational",
        voice: "es-ES_LauraVoice"
    },
    french: {
        modelId: "en-fr-conversational",
        voice: "fr-FR_ReneeVoice"
    },
    portuguese: {
        modelId: "en-pt-conversational",
        voice: "pt-BR_IsabelaVoice"
    },
    german: {
        modelId: "en-de",
        voice: "de-DE_BirgitVoice"
    },
    italian: {
        modelId: "en-it",
        voice: "it-IT_FrancescaVoice"
    },
    japanese: {
        modelId: "en-ja",
        voice: "ja-JP_EmiVoice"
    }
};

var elementsArray = document.getElementsByTagName('*');
for (var i = 0; i < elementsArray.length; i++) {
    elementsArray[i].addEventListener("focus", function () {
        var value = this.innerHTML;
            if (value) {
                playBlob(value);
            }
    });
    elementsArray[i].addEventListener("mouseleave", function (e) {
        currentElement = "";
    });
    elementsArray[i].addEventListener("mouseover", function (e) {
        var element = e.target;
        // var childElement = element.firstElementChild;
        // if (childElement) {
        //     console.log("nope");
        //     return;
        // }
        // the following x and y method prevents the double speak on elements inside of elements
        var x = e.clientX;
        var y = e.clientY;
        var element = document.elementFromPoint(x, y);
        currentElement = element;
        var value = "";
        // update string to send to IBM API depending upon tag
        switch(element.nodeName)
        {
            case "INPUT":
                value = element.value;
                if (element.type === "submit") {
                    value += " button";
                } else if (element.type === "text") {
                    value += " text box input";
                }
                break;
            case "DIV":
                value = "";
                break;
            case "A":
                if (element.innerText) {
                    value = "Link to ";
                    value += element.innerText;
                } else  if (element.href) {
                    value = "Link to ";
                    value += element.href;
                } else if (element.title) {
                    value = "Link to ";
                    value += element.title;
                } else {
                    value = "Unknown link";
                }
                break;
            case "H1","H2","H3","H4":
                value = element.innerText;
                value += " title";
                break;
            case "IMG":
                value = element.innerText;
                value += "Image of " + element.alt;
                break;
            default:
                value = element.innerText;
        } 
        
        // if a sound has started playing within the WAIT_TIME interval, then queue up the current event
        if (block && value) {
            setTimeout(function () {
                // if the mouse is still over the element even after its queue time
                if (currentElement === element) {
                    // if the current queued event is not blocked by a previously queued event and its not repeating the last played element
                    if (!block && element !== lastPlayedElement) {
                        console.log("Element:", element);
                        // block further events for the WAIT_TIME interval (the blocked events will be queued)
                        block = true;
                        // unblock events after WAIT_TIME interval
                        setTimeout(function () {
                            block = false;
                        }, WAIT_TIME);
                        // let the browser know that this element is the most recently played element so its not replayed
                        lastPlayedElement = element;
                        playBlob(value);
                    }
                }
            }, WAIT_TIME);
        // if no sound has been played in the last WAIT_TIME amount of time
        } else if (value) {
            console.log("Element:", element);
            // block further events for the WAIT_TIME interval (the blocked events will be queued)
            block = true;
            // unblock events after WAIT_TIME interval
            setTimeout(function () {
                block = false;
            }, WAIT_TIME);
            // let the browser know that this element is the most recently played element so its not replayed
            lastPlayedElement = element;
            playBlob(value);
        }
    });
}

function playBlob(text) 
{
    var APIType; 
    chrome.storage.sync.get("APIType", function(items) {
        var APIType = items.APIType;
    })
    
    // FREE GOOGLE API TEXT-TO-SPEECH

    // var msg = new SpeechSynthesisUtterance(text);
    // speechSynthesis.speak(msg);

    // FREE GOOGLE API TEXT-TO-SPEECH

    chrome.storage.sync.get("isOn", function (items) {
        var isOn = items.isOn;
        // only run ajax calls if we have a string to send and the app is turned on or isOn is undefined
        if (!text || isOn === false) {
            return;
        }
        // keep strings to length of 20 for testing so we don't exceed API limits
        if (text.length > 20)
        {
            text = text.substring(0,20);
        }
        text = text.replace(/</g, ' less than symbol ');
        text = text.replace(/>/g, ' greater than symbol ');

        chrome.storage.sync.get('language', function (items) {
            if (items.language) {
                chosenLanguage = items.language;
            }

            // if chosen language is not english, translate text to foreign language
            if (languages[chosenLanguage].modelId) {
                translateAjax(text, function (response) {
                    var spanishText = response.translations[0].translation;
                    textToSpeechAjax(spanishText, function (response) {
                        var blob = new Blob([response], { "type": "audio/wav" });
                        var objectUrl = window.URL.createObjectURL(blob);
                        audio.src = objectUrl;
                        audio.play();
                    });
                });
            // if english, don't translate
            } else {
                textToSpeechAjax(text, function (response) {
                    var blob = new Blob([response], { "type": "audio/wav" });
                    var objectUrl = window.URL.createObjectURL(blob);
                    audio.src = objectUrl;
                    audio.play();
                });
            }
        });
    });
}

var TEXT_TO_SPEECH_AUTH = "Basic NWEwMTM4ZDktMDMyNS00NzNkLWI4NTgtMzFhYzNhZmU3NzY1Onlva0F6Y3JkbDZHRA==";
var TRANSLATION_AUTH = "Basic M2VhMWQwOTctZDRhZS00MzAwLTllN2MtNGQ1MmQ1ZGRmNWNjOkxwQ2RUWGdyUU02Vg==";

function textToSpeechAjax(text, callback) {
    var url = "https://stream.watsonplatform.net/text-to-speech/api/v1/synthesize?accept=audio/wav&voice=" + languages[chosenLanguage].voice;
    $.ajax({
        url: url,
        method: "POST",
        headers: {
            "Authorization": TEXT_TO_SPEECH_AUTH,
            "output": "speech.wav",
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        },
        data: JSON.stringify({text: text}),
        dataType: "binary",
        responseType: "arraybuffer"
    }).then(function (response) {
        callback(response);
    }).fail(function (jqXHR, textStatus) {
        console.log("jqXHR:", jqXHR);
        console.log("textStatus:", textStatus);
    });
};

function translateAjax(text, callback) {
    var url = "https://gateway.watsonplatform.net/language-translator/api/v2/translate";
    $.ajax({
        url: url,
        method: "GET",
        headers: {
            "Authorization": TRANSLATION_AUTH,
            "Accept": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        data: {
            text: text,
            model_id: languages[chosenLanguage].modelId
        }
    }).then(function (response) {
        callback(response);
    });
};

function getLanguagesAjax(callback) {
    var url = "https://gateway.watsonplatform.net/language-translator/api/v2/identifiable_languages"
    $.ajax({
        url: url,
        method: "GET",
        headers: {
            "Authorization": TRANSLATION_AUTH,
            "Access-Control-Allow-Origin": "*"
        }
    }).then(function (response) {
        callback(response.languages);
    });
};

function getLanguageModelsAjax(callback) {
    var url = "https://gateway.watsonplatform.net/language-translator/api/v2/models"
    $.ajax({
        url: url,
        method: "GET",
        headers: {
            "Authorization": TRANSLATION_AUTH,
            "Access-Control-Allow-Origin": "*"
        }
    }).then(function (response) {
        callback(response.models);
    });
};

function detectLanguageAjax(text, callback) {
    var url = "https://gateway.watsonplatform.net/language-translator/api/v2/identify"
    $.ajax({
        url: url,
        method: "POST",
        headers: {
            "Authorization": TRANSLATION_AUTH,
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "text/plain"
        },
        data: text
    }).then(function (languageBestGuess) {
        callback(languageBestGuess);
    });
};

$.ajaxTransport("+binary", function (options, originalOptions, jqXHR) {
    // check for conditions and support for blob / arraybuffer response type
    if (window.FormData && ((options.dataType && (options.dataType == 'binary')) || (options.data && ((window.ArrayBuffer && options.data instanceof ArrayBuffer) || (window.Blob && options.data instanceof Blob))))) {
        return {
            // create new XMLHttpRequest
            send: function (headers, callback) {
                // setup all variables
                var xhr = new XMLHttpRequest(),
                    url = options.url,
                    type = options.type,
                    async = options.async || true,
                    // blob or arraybuffer. Default is blob
                    dataType = options.responseType || "blob",
                    data = options.data || null,
                    username = options.username || null,
                    password = options.password || null;

                xhr.addEventListener('load', function () {
                    var data = {};
                    data[options.dataType] = xhr.response;
                    // make callback and send data
                    callback(xhr.status, xhr.statusText, data, xhr.getAllResponseHeaders());
                });

                xhr.open(type, url, async, username, password);

                // setup custom headers
                for (var i in headers) {
                    xhr.setRequestHeader(i, headers[i]);
                }

                xhr.responseType = dataType;
                xhr.send(data);
            },
            abort: function () {
                jqXHR.abort();
            }
        };
    }
});

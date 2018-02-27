var audio = new Audio();
var block = false;
var WAIT_TIME = 500;
var currentElement;
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

var isOn = false;

chrome.storage.sync.get("isOn", function(items) {
   isOn = items.isOn; 
});



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


var elementsArray = document.getElementsByTagName('*');
for (var i = 0; i < elementsArray.length; i++) {
    elementsArray[i].addEventListener("focus", function () {
        var englishText = this.innerHTML;
        chrome.storage.sync.get('language', function (items) {
            chosenLanguage = items.language;
            // if English
            if (!languages[chosenLanguage].modelId && englishText) {
                playBlob(englishText);
            // if not English
            } else if (languages[chosenLanguage].modelId && englishText) {
                translateAjax(englishText, function (response) {
                    var spanishText = response.translations[0].translation;
                    playBlob(spanishText);
                });
            }
        });
    });
    elementsArray[i].addEventListener("mouseleave", function (e) {
        currentElement = "";
    });
    elementsArray[i].addEventListener("mouseenter", function (e) {
        var element = e.target;
        currentElement = element;
        var value = ""; 
        //console.log(element); 
        switch(element.nodeName)
        {
            case "INPUT":
                value = element.value;
                value += " button";
                break;
            case "DIV":
                value = "";
                break;
            case "A":
                value = "link to ";
                value += element.innerText;
                break;
            case "H1","H2","H3","H4":
                value = element.innerText;
                value += " title";
                break;
            case "IMG":
                value = element.innerText;
                value += " Image " + element.alt;
                break;
            default:
                value = element.innerText;
        }
        //console.log(value);  
          
        chrome.storage.sync.get('language', function (items) {
            chosenLanguage = items.language;
            // if English
            console.log(block);
            if (block) {
                setTimeout(function () {
                    if (currentElement === element) {
                        if (!languages[chosenLanguage].modelId && value) {
                            playBlob(value);
                            // if not English
                        } else if (languages[chosenLanguage].modelId && value) {
                            translateAjax(value, function (response) {
                                var spanishText = response.translations[0].translation;
                                playBlob(spanishText);
                            });
                        }
                    }
                }, WAIT_TIME);
            } else {
                if (!languages[chosenLanguage].modelId && value) {
                    playBlob(value);
                // if not English
                } else if (languages[chosenLanguage].modelId && value) {
                    translateAjax(value, function (response) {
                        var spanishText = response.translations[0].translation;
                        playBlob(spanishText); 
                    });
                }
            }
        });
    });
}

function playBlob(text) 
{
    textToSpeechAjax(text, function (response) {
        var blob = new Blob([response], { "type": "audio/wav" });
        var objectUrl = window.URL.createObjectURL(blob);
        audio.src = objectUrl;
        var isPlaying = audio.currentTime > 0 && !audio.paused && !audio.ended && audio.readyState > 2;
        if(!isPlaying)
            audio.play();
        block = true;
        setTimeout(function () {
            block = false;
        }, WAIT_TIME);
    });
}

var TEXT_TO_SPEECH_AUTH = "Basic YjZhM2YxNWUtMjhmNi00OTc4LTk1YWMtOTQwZjI3MGY4MTE3OnRVRTRyT3ZNSHVyWg==";
var TRANSLATION_AUTH = "Basic M2VhMWQwOTctZDRhZS00MzAwLTllN2MtNGQ1MmQ1ZGRmNWNjOkxwQ2RUWGdyUU02Vg==";

function textToSpeechAjax(text, callback) {
    if(isOn)
    {
        var url = "https://stream.watsonplatform.net/text-to-speech/api/v1/synthesize?accept=audio/wav&voice=" + languages[chosenLanguage].voice;
        $.ajax({
            url: url,
            method: "GET",
            headers: {
                "Authorization": TEXT_TO_SPEECH_AUTH,
                "output": "speech.wav",
                "Access-Control-Allow-Origin": "*"
            },
            data: {
                text: text
            },
            dataType: "binary",
            responseType: "arraybuffer"
        }).then(function (response) {
            callback(response);
        });
    }
};

function translateAjax(text, callback) {
    if(isOn)
    {
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
    }
};

function getLanguagesAjax(callback) {
    if(isOn)
    {
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
    }
};

function getLanguageModelsAjax(callback) {
    if(isOn) 
    {
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
    }
};

function detectLanguageAjax(text, callback) {
    if(isOn) 
    {
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
    }
};
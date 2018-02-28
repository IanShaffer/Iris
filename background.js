
// background variables
var APIType = "GOOGLE";
var audio = new Audio();
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

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    var text = request.text;
    chrome.storage.sync.get(["isOn", "APIType"], function (items) {
        var isOn = items.isOn;
        if (items.APIType) {
            APIType = items.APIType;
        }
        // only run ajax calls if we have a string to send and the app is turned on or isOn is undefined
        if (!text || isOn === false) {
            return;
        }
        // keep strings to length of 20 for testing so we don't exceed API limits
        if (text.length > 20) {
            text = text.substring(0, 20);
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
            } else if (APIType === "WATSON") {
                textToSpeechAjax(text, function (response) {
                    var blob = new Blob([response], { "type": "audio/wav" });
                    var objectUrl = window.URL.createObjectURL(blob);
                    audio.src = objectUrl;
                    audio.play();
                });
            // if english and google API, then use google text to speech API
            } else {
                var msg = new SpeechSynthesisUtterance(text);
                speechSynthesis.cancel();
                speechSynthesis.speak(msg);
            }
        });
    });
});

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
        data: JSON.stringify({ text: text }),
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
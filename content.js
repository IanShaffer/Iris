
var elementsArray = document.getElementsByTagName('*');
for (var i = 0; i < elementsArray.length; i++) {
    elementsArray[i].addEventListener("focus", function () {
        console.log(this.innerHTML);
    });
};

console.log("oi");

textToSpeech("hey", function(response){
    console.log(response);
});

function textToSpeech(text, callback) {
    console.log("1");
    var xmlHttp = new XMLHttpRequest();
    var url = "https://stream.watsonplatform.net/text-to-speech/api/v1/synthesize?accept=audio/wav&text=" + text + "&voice=en-US_AllisonVoice"
    xmlHttp.onreadystatechange = function () {
        console.log("3");
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            callback(xmlHttp.responseText);
        } else {
            console.log("2");
        }
    }
    xmlHttp.open("GET", url, true); // true for asynchronous
    xmlHttp.setRequestHeader("Authorization", "Basic YzM4Mzk3Y2QtZTE5YS00M2FlLWJmNDEtMzc3YjRlMjc2NGIzOkFwNkpsN3daS1FFRA==");
    xmlHttp.setRequestHeader("output", "speech.wav");
    console.log("4");
    xmlHttp.send(null);
    console.log("5");
};
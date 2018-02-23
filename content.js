
var elementsArray = document.getElementsByTagName('*');
for (var i = 0; i < elementsArray.length; i++) {
    elementsArray[i].addEventListener("focus", function () {
        console.log(this.innerHTML);
    });
};

textToSpeechAjax("hey", function(response){
    for (var i = 0; i < response.length; i++) {
        console.log(i + ": " + response[i]);
    }

    var objectUrl = URL.createObjectURL(response);
    var audio = new Audio(objectUrl);
    audio.play();
});

function textToSpeechAjax(text, callback) {
    var url = "https://stream.watsonplatform.net/text-to-speech/api/v1/synthesize?accept=audio/wav&text=" + text + "&voice=en-US_AllisonVoice"
    $.ajax({
        url: url,
        method: "GET",
        headers: {
            "Authorization": "Basic YzM4Mzk3Y2QtZTE5YS00M2FlLWJmNDEtMzc3YjRlMjc2NGIzOkFwNkpsN3daS1FFRA==",
            "output": "speech.wav"
        }
    }).then(function (response) {
        callback(response);
    });
}

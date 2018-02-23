
var elementsArray = document.getElementsByTagName('*');
for (var i = 0; i < elementsArray.length; i++) {
    elementsArray[i].addEventListener("focus", function () {
        console.log(this.innerHTML);
    });
};

textToSpeechAjax("hey", function(response){
    console.log("hhh");
    var blob = new Blob([response]);
    console.log(blob);
    var objectUrl = URL.createObjectURL(blob);
    console.log(objectUrl);
    var audio = new Audio(objectUrl);
    audio.play();

});

function textToSpeechAjax(text, callback) {
    console.log("eee");
    var url = "https://stream.watsonplatform.net/text-to-speech/api/v1/synthesize?accept=audio/wav&text=" + text + "&voice=en-US_AllisonVoice"
    $.ajax({
        url: url,
        method: "GET",
        headers: {
            "Authorization": "Basic YzM4Mzk3Y2QtZTE5YS00M2FlLWJmNDEtMzc3YjRlMjc2NGIzOkFwNkpsN3daS1FFRA==",
            "output": "speech.wav",
            "content-type": "binary"
        }
    }).then(function (response) {
        callback(response);
    });
}

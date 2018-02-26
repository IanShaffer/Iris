
var elementsArray = document.getElementsByTagName('*');
for (var i = 0; i < elementsArray.length; i++) {
    elementsArray[i].addEventListener("focus", function () {
        textToSpeechAjax(this.innerHTML, function (response) {
            var blob = new Blob([response], { "type": "audio/wav" });
            var objectUrl = window.URL.createObjectURL(blob);
            console.log(objectUrl);
            var audio = new Audio(objectUrl);
            audio.play();
        });
        console.log(this.innerHTML);
    });
    elementsArray[i].addEventListener("mouseenter", function (e) {
        var element = e.target;
        if (element.textContent);
            console.log(element.textContent); 
    });

}


$(document).on("hover", function(event){
    console.log($(event.target).text());
})



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


// textToSpeechAjax("charlie is awesome", function(response){
//     var blob = new Blob([response], {"type": "audio/wav"});
//     var objectUrl = window.URL.createObjectURL(blob); 
//     console.log(objectUrl); 
//     var audio = new Audio(objectUrl);
//     audio.play();
// });

function textToSpeechAjax(text, callback) {
    var url = "https://stream.watsonplatform.net/text-to-speech/api/v1/synthesize?accept=audio/wav&text=" + text + "&voice=en-US_AllisonVoice"
    $.ajax({
        url: url,
        method: "GET",
        headers: {
            "Authorization": "Basic YzM4Mzk3Y2QtZTE5YS00M2FlLWJmNDEtMzc3YjRlMjc2NGIzOkFwNkpsN3daS1FFRA==",
            "output": "speech.wav",
            "Access-Control-Allow-Origin": "*"
        },
        dataType: "binary",
        responseType: "arraybuffer"
    }).then(function (response) {
        callback(response);
    });
}

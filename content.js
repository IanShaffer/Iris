
// content variables
var block = false;
var WAIT_TIME = 500;
var currentElement;
var lastPlayedElement;

// document.addEventListener("bind", function (e) {
//     console.log("hey");
//     console.log(e);
// });

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
        console.log("test");
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

function playBlob(text) {
    chrome.runtime.sendMessage({ text: text });
}
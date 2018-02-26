
document.addEventListener('DOMContentLoaded', function () {
    var checkPageButton = document.getElementById('checkPage');
    checkPageButton.addEventListener('click', function () {
        alert('test');
    }, false);
}, false);

chrome.windows.getCurrent({}, function (windows) {
    console.log(windows);
});

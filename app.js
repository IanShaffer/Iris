
    document.addEventListener('DOMContentLoaded', function () {
        var checkPageButton = document.getElementById('checkPage');
        checkPageButton.addEventListener('click', function () {
            alert('test');
        }, false);
    }, false);

    if (jQuery) {  
        alert("jquery loaded");
    } else {
        // jQuery not loaded
    }

    $(document).ready(function() { 
        $("#checkPage").on("click", function() {
           alert("YAY!"); 
        });
    }); 

    document.addEventListener('DOMContentLoaded', function () {
        var checkPageButton = document.getElementById('checkPage');
        checkPageButton.addEventListener('click', function () {
            alert('test');
        }, false);
    }, false);

    $(document).ready(function() { 
        $("#checkPage").on("click", function() {
           alert("YAY!"); 
        });
    }); 
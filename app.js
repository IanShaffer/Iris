var languages = ['English', 'Spanish', 'French'];


$(document).ready(function(){
    for (i=0; i<languages.length; i++) {
        var newDiv = $('<div>');
        $(newDiv).attr('class', 'single-language');
        $(newDiv).text(languages[i]);
    
        $('.languages').append(newDiv);
        console.log(newDiv);
    }
})
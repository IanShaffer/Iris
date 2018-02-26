var languages = ['English', 'Spanish', 'French'];


$(document).ready(function(){
    for (i=0; i<languages.length; i++) {
        var newOption = $('<option>');
        $(newOption).attr('class', 'single-language');
        $(newOption).attr('value', languages[i]);
        $(newOption).text(languages[i]);
    
        $('.languages').append(newOption);
        console.log(newOption);
    }
})
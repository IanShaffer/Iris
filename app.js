var languages = ['English', 'Spanish', 'French', 'Portguese', 'Italian', 'German', 'Japanese'];


$(document).ready(function(){
    for (i=0; i<languages.length; i++) {
        var newOption = $('<option>');
        $(newOption).attr('class', 'single-language');
        $(newOption).attr('value', languages[i].toLowerCase());
        $(newOption).text(languages[i]);
    
        $('.languages').append(newOption);
        console.log(newOption);
    }

    chrome.storage.sync.get(['language'], function(items) {
        if (items.language) {
            $('.languages').find("[value='"+ items.language+"']").attr("selected", true);
        }
        console.log(items);
      });

    $(document).change(function(){
        var setLanguage = $('.languages').find(":selected").val();
        chrome.storage.sync.set({'language': setLanguage}, function() {
            // console.log(setLanguage);
          });
    })
    
    chrome.storage.sync.get("isOn", function(items) {
        $("#isOn").attr("checked", items.isOn); 
    });

    $("#isOn").change(function() {
        var value = $("#isOn").is(":checked");
        chrome.storage.sync.set({"isOn":value}, function() { 
        }); 
    });



})
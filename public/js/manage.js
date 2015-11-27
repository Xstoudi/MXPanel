(function(){
    var links = $('#manage-btn-control #new-user-input #domain-selection .dropdown-menu a');

    links.each(function(i, link){
        link = $(link);
        link.on('click', function(){
            $('#domain-selection-button').html(link.html())
        });
    });

    var addButton = $('#manage-btn-control .btn-success');
    addButton.on('click', function(){
        if($('#password input').val() != $('#password-repeat input').val()){
            alert("Les mots de passe doivent correspondre !");
        } else {
            //fait ce que tu veux :D
        }
    });
})();

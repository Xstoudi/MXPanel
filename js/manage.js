(function(){
    var links = $('#manage-btn-control #new-user-input #domain-selection .dropdown-menu a');

    links.each(function(i, link){
        link = $(link);
        link.on('click', function(){
            $('#domain-selection-button').html(link.html())
        });
    });
})();

$(function(){

  $('.cell').each(function( index ) {

    $(this).addClass('cell-'+$(this).data('idx'));
    // console.log( index + ": " + $( this ).text() );
  });

  $(document).on("click", "#toast-restart", function() {

    $('#restart').click();
    $('.toast').remove();

  });
});

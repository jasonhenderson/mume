WebkitSvgLink = function() {};

WebkitSvgLink.prototype.openLink = function(el) {
  var link = $(el).attr('href');
  var win = null;
  win = window.open(link, '_self');
  win.focus();
};

window.WebkitSvgLink = new WebkitSvgLink();

$(function(){
  $(document).on('click', '.webkit-link', function(e) {
    e.stopPropagation();
    window.WebkitSvgLink.openLink($(this));
    return false;
  });
});

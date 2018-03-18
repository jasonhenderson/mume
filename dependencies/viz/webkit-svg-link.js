WebkitSvgLink = function() {};

WebkitSvgLink.prototype.openLink = function(el) {
  var link = el.getAttribute('href');
  var win = null;
  win = window.open(link, '_self');
  win.focus();
};

window.WebkitSvgLink = new WebkitSvgLink();

function svgClick(e) {
  console.log("canceled")
  e.preventDefault();
  //e.stopPropagation();
  window.WebkitSvgLink.openLink(e.target);
};

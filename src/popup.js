document.addEventListener('DOMContentLoaded', function() {
  var serviceLinks = document.getElementsByClassName("service-link") || [];
  for (var i = 0; i < serviceLinks.length; i++) {
    var serviceLink = serviceLinks[i];
    if (serviceLink) {
      serviceLink.onclick = function (evt) {
        var serviceUrl = evt.target.getAttribute("data-service-url");
        if (serviceUrl) {
          chrome.tabs.create({active: true, url: serviceUrl});
        }
      };
    }
  }
});

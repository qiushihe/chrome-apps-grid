var OptionsSaving = false;

var clearOptions = function () {
  var options = document.getElementById("options");
  if (options) {
    while (options.firstChild) {
      options.removeChild(options.firstChild);
    }
  }
};

var getServiceElement = function (service, enabled) {
  var serviceInfo = AppsGrid.AllServices[service];
  if (!serviceInfo || !serviceInfo.label || !serviceInfo.url) {
    return null;
  }

  var element = document.createElement("li");
  element.id = "service-" + service;
  element.className = enabled ? "service-item enabled" : "service-item";
  element.setAttribute("data-service-name", service);

  var indicator = document.createElement("div");
  indicator.className = "indicator";
  indicator.appendChild(document.createElement("div"));

  element.appendChild(indicator);

  var link = document.createElement("a");
  link.className = "clearfix";
  link.innerText = serviceInfo.label;

  element.appendChild(link);
  element.onclick = function () {
    if (element.className.match(/enabled/) && getEnabledServices().length > 1) {
      element.className = "service-item";
    } else {
      element.className = "service-item enabled";
    }

    saveOptions();
  };
  return element;
};

var getEnabledServices = function () {
  var enabledItems = [];
  var serviceItems = document.getElementsByClassName("service-item") || [];
  for (var i = 0; i < serviceItems.length; i++) {
    var serviceItem = serviceItems[i];
    if (serviceItem.className.match(/enabled/)) {
      enabledItems.push(serviceItem.getAttribute("data-service-name"));
    }
  }
  return enabledItems;
};

var saveOptions = function () {
  if (OptionsSaving) {
    return;
  }

  var enabledItems = getEnabledServices();
  var storageKey = "apps-grid-enabled-services";
  var data = {};
  data[storageKey] = enabledItems;

  OptionsSaving = true;
  chrome.storage.sync.set(data, function() {
    OptionsSaving = false;
  });
};

var rebuildOptions = function (services, enabledServices) {
  clearOptions();

  var options = document.getElementById("options");
  if (options) {
    for (var i = 0; i < services.length; i++) {
      var service = services[i];
      var enabled = enabledServices.indexOf(service) >= 0;
      var element = getServiceElement(service, enabled);
      if (element) {
        options.appendChild(element);
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', function () {
  AppsGrid.GetEnabledServices(function (enabledServices) {
    rebuildOptions(Object.keys(AppsGrid.AllServices), enabledServices);
  });
});

var OptionsSaving = false;

var clearOptions = function () {
  var options = document.getElementById("options");
  if (options) {
    while (options.firstChild) {
      options.removeChild(options.firstChild);
    }
  }
};

var getServiceElement = function (service) {
  if (!service || !service.label) {
    return null;
  }

  var element = document.createElement("li");
  element.id = "service-" + service.id;
  element.className = "menu-item menu-item-service " + (service.enabled ? "enabled" : "");
  element.setAttribute("data-item-name", service.id);

  element.onclick = function () {
    if (element.className.match(/enabled/) && getEnabledServices().length > 1) {
      element.className = "menu-item menu-item-service";
    } else {
      element.className = "menu-item menu-item-service enabled";
    }

    saveOptions();
  };

  var indicator = document.createElement("div");
  indicator.className = "indicator";
  indicator.appendChild(document.createElement("div"));
  element.appendChild(indicator);

  var link = document.createElement("a");
  link.className = "clearfix";
  element.appendChild(link);

  var icon = document.createElement("span");
  icon.className = "icon";
  link.appendChild(icon);

  var text = document.createElement("span");
  text.className = "label";
  text.innerText = service.label;
  link.appendChild(text);

  return element;
};

var getEnabledServices = function () {
  var enabledItems = [];
  var serviceItems = document.getElementsByClassName("menu-item") || [];
  for (var i = 0; i < serviceItems.length; i++) {
    var serviceItem = serviceItems[i];
    if (serviceItem.className.match(/enabled/)) {
      enabledItems.push(serviceItem.getAttribute("data-item-name"));
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

var rebuildOptions = function (allServices) {
  clearOptions();

  var options = document.getElementById("options");
  if (options) {
    allServices.forEach(function (service) {
      var element = getServiceElement(service);
      if (element) {
        options.appendChild(element);
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', function () {
  AppsGrid.GetAllServices().then(function (allServices) {
    rebuildOptions(allServices);
  });
});

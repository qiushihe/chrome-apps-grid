var OptionsSavingFlags = {};

var getServicesList = function () {
  return document.querySelector(".content-section-services .options-list");
};

var clearOptions = function () {
  var options = getServicesList();
  if (options) {
    while (options.firstChild) {
      options.removeChild(options.firstChild);
    }
  }
};

var getOptionElement = function (dataId, options) {
  var element = document.createElement("li");
  element.id = options.id;
  element.className = "menu-item menu-item-" + options.type + " " + (options.enabled ? "enabled" : "");
  element.setAttribute("data-item-name", dataId);

  element.onclick = function () {
    if (element.className.match(/enabled/) && getEnabledOptions(options.type).length > 1) {
      element.className = "menu-item menu-item-" + options.type;
    } else {
      element.className = "menu-item menu-item-" + options.type + " enabled";
    }
    saveOptions(options.type);
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
  text.innerText = options.label;
  link.appendChild(text);

  return element;
};

var getEnabledOptions = function (type) {
  var enabledItems = [];
  var optionItems = document.getElementsByClassName("menu-item-" + type) || [];
  for (var i = 0; i < optionItems.length; i++) {
    var optionItem = optionItems[i];
    if (optionItem.className.match(/enabled/)) {
      enabledItems.push(optionItem.getAttribute("data-item-name"));
    }
  }
  return enabledItems;
};

var saveOptions = function (type) {
  if (OptionsSavingFlags[type]) {
    return;
  }

  var enabledItems = getEnabledOptions(type);
  var storageKey = "apps-grid-enabled-" + type;
  var data = {};
  data[storageKey] = enabledItems;

  OptionsSavingFlags[type] = true;
  chrome.storage.sync.set(data, function() {
    OptionsSavingFlags[type] = false;
  });
};

var rebuildOptions = function (allServices) {
  clearOptions();

  var options = getServicesList();
  if (options) {
    allServices.forEach(function (service) {
      if (service && service.label) {
        var element = getOptionElement(service.id, {
          id: "service-" + service.id,
          enabled: service.enabled,
          label: service.label,
          type: "service"
        });
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

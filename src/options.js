var OptionsSavingFlags = {};

var getAppsList = function () {
  return document.querySelector(".content-section-apps .options-list");
};

var getServicesList = function () {
  return document.querySelector(".content-section-services .options-list");
};

var clearOptions = function (list) {
  if (list) {
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }
  }
};

var getOptionElement = function (dataId, options) {
  var element = document.createElement("li");
  element.id = options.id;
  element.className = "menu-item menu-item-" + options.type;
  element.setAttribute("data-item-type", options.type);
  element.setAttribute("data-item-name", dataId);
  element.setAttribute("data-enabled", options.enabled ? "true" : "false");

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
    if (optionItem.getAttribute("data-enabled") === "true") {
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

var rebuildApps = function (apps) {
  clearOptions(getAppsList());

  var list = getAppsList();
  if (list) {
    apps.forEach(function (app) {
      var element = getOptionElement(app.id, {
        id: "app-" + app.id,
        enabled: app.enabled,
        label: app.shortName,
        type: "app"
      });

      var iconElement = element.querySelector("a .icon");
      if (iconElement) {
        var iconUrl = app.icons.reduce(function (largestIcon, icon) {
          return icon.size > largestIcon.size ? icon : largestIcon;
        }, {size: 0, url: null}).url;
        iconElement.style["backgroundImage"] = "url(" + iconUrl + ")";
      }
      
      list.appendChild(element);
    });
  }
};

var rebuildServices = function (services) {
  clearOptions(getServicesList());

  var list = getServicesList();
  if (list) {
    services.forEach(function (service) {
      if (service && service.label) {
        var element = getOptionElement(service.id, {
          id: "service-" + service.id,
          enabled: service.enabled,
          label: service.label,
          type: "service"
        });
        list.appendChild(element);
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', function () {
  Promise.all([
    AppsGrid.GetAllApps().then(function (apps) {
      return rebuildApps(apps);
    }),
    AppsGrid.GetAllServices().then(function (services) {
      return rebuildServices(services);
    })
  ]).then(function () {
    document.querySelectorAll(".options-list .menu-item").forEach(function (element) {
      element.onclick = function () {
        if (element.getAttribute("data-enabled") === "true") {
          element.setAttribute("data-enabled", "false");
        } else {
          element.setAttribute("data-enabled", "true");
        }

        var type = element.getAttribute("data-item-type");
        if (type === "service") {
          if (getEnabledOptions(type).length <= 0) {
            element.setAttribute("data-enabled", "true");
          }
          saveOptions(type);
        } else if (type === "app") {
          saveOptions(type);
        }
      };
    });
  });
});

var SortableInstances = {};
var SortableSaving = false;

var getAppsArea = function () {
  return document.querySelector("#services-areas .services-area-apps");
};

var getServicesArea = function () {
  return document.querySelector("#services-areas .services-area-services");
};

var getAppsList = function () {
  return document.querySelector(".services-area-apps .services-list");
};

var getServiesList = function () {
  return document.querySelector(".services-area-services .services-list");
};

var clearList = function (area, list) {
  if (area) {
    area.setAttribute("data-is-empty", "true");
  }

  if (list) {
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }
  }
};

var getMenuItemElement = function (dataId, options) {
  var element = document.createElement("li");
  element.id = options.id;
  element.className = "menu-item menu-item-" + options.type;
  element.setAttribute("data-" + options.type + "-name", dataId);

  var link = document.createElement("a");
  link.onclick = function () {
    options.onClick(options.onClickData)
  };
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

var onAppClicked = function (app) {
  chrome.management.launchApp(app.id, function () {
    // Close the extension popup
    window.close();
  });
};

var rebuildAppsMenu = function (apps) {
  clearList(getAppsArea(), getAppsList());

  var list = getAppsList();
  var isEmpty = true;

  if (list) {
    apps.forEach(function (app) {
      var element = getMenuItemElement(app.id, {
        id: "app-" + app.id,
        type: "app",
        label: app.shortName,
        onClick: onAppClicked,
        onClickData: app
      });

      var iconElement = element.querySelector("a .icon");
      if (iconElement) {
        var iconUrl = app.icons.reduce(function (largestIcon, icon) {
          return icon.size > largestIcon.size ? icon : largestIcon;
        }, {size: 0, url: null}).url;
        iconElement.style["backgroundImage"] = "url(" + iconUrl + ")";
      }

      list.appendChild(element);
      isEmpty = false;
    });
  }

  getAppsArea().setAttribute("data-is-empty", isEmpty ? "true" : "false");
};

var onServiceClicked = function (service) {
  if (service && service.url) {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
      var tab = tabs[0];

      if (tab && tab.url && tab.url.match(/chrome:\/\/newtab/)) {
        // Replace the current tab with the selected service if the current tab is the "new tab" tab
        chrome.tabs.update(tab.id, {url: service.url});
      } else {
        // Open a new tab for the selected service if the current tab is not the "new tab" tab
        chrome.tabs.create({active: true, url: service.url});
      }

      // Close the extension popup
      window.close();
    });
  }
};

var rebuildServicesMenu = function (services) {
  clearList(getServicesArea(), getServiesList());

  var list = getServiesList();
  var isEmpty = true;

  if (list) {
    services.forEach(function (service) {
      if (service && service.label) {
        var element = getMenuItemElement(service.id, {
          id: "service-" + service.id,
          type: "service",
          label: service.label,
          onClick: onServiceClicked,
          onClickData: service
        });
        list.appendChild(element);
        isEmpty = false;
      }
    });
  }

  getServicesArea().setAttribute("data-is-empty", isEmpty ? "true" : "false");
};

var loadOrder = function (type, sortable) {
  var storageKey = "apps-grid-" + type + "-order";
  chrome.storage.sync.get(storageKey, function(data) {
    var order = data[storageKey];
    if (order) {
      sortable.sort(order);
    }
  });
};

var saveOrder = function (type, sortable) {
  if (SortableSaving) {
    return;
  }

  var storageKey = "apps-grid-" + type + "-order";
  var order = sortable.toArray();

  var data = {};
  data[storageKey] = order;

  SortableSaving = true;
  chrome.storage.sync.set(data, function() {
    SortableSaving = false;
  });
};

var initializeSortable = function (type, list) {
  if (SortableInstances[type]) {
    SortableInstances[type].destroy();
    SortableInstances[type] = null;
  }

  if (list) {
    SortableInstances[type] = Sortable.create(list, {
      dataIdAttr: "data-" + type + "-name",
      onSort: function () {
        saveOrder(type, this); // The `this` inside this function is the sortable instance.
      }
    });

    loadOrder(type, SortableInstances[type]);
  }
};

document.addEventListener("DOMContentLoaded", function() {
  document.querySelector("#services-areas").setAttribute("data-has-multiple-areas", "false");
  document.querySelectorAll("#services-areas .services-area").forEach(function (servicesArea) {
    servicesArea.setAttribute("data-is-empty", "true");
  });

  AppsGrid.GetEnabledAreas().then(function (areas) {
    var areaPromises = areas.map(function (area) {
      if (area === "apps") {
        return AppsGrid.GetEnabledApps().then(function (apps) {
          return rebuildAppsMenu(apps);
        }).then(function () {
          return initializeSortable("app", getAppsList());
        });
      } else if (area == "services") {
        return AppsGrid.GetEnabledServices().then(function (services) {
          return rebuildServicesMenu(services);
        }).then(function () {
          return initializeSortable("service", getServiesList());
        })
      } else {
        return Promise.resolve();
      }
    });

    Promise.all(areaPromises).then(function () {
      if (document.querySelectorAll("#services-areas .services-area[data-is-empty=\"false\"]").length > 1) {
        document.querySelector("#services-areas").setAttribute("data-has-multiple-areas", "true");
      }
    });
  });

  document.getElementById("footer-more").onclick = function () {
    chrome.tabs.create({url: "chrome://extensions/?options=" + chrome.runtime.id });
  };
});

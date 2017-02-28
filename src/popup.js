var SortableInstance = null;
var SortableSaving = false;

var getAppsList = function () {
  return document.querySelector(".services-area-apps .services-list");
};

var getServiesList = function () {
  return document.querySelector(".services-area-services .services-list");
};

var clearList = function (list) {
  if (list) {
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }
  }
};

var getMenuItemElement = function (name, options) {
  var element = document.createElement("li");
  element.id = options.id;
  element.className = "menu-item menu-item-" + options.type;
  element.setAttribute("data-" + options.type + "-name", name);

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
  clearList(getAppsList());

  var list = getAppsList();
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
    });
  }
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
  clearList(getServiesList());

  var list = getServiesList();
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
      }
    });
  }
};

var loadOrder = function (sortable) {
  var storageKey = "apps-grid-services-order";
  chrome.storage.sync.get(storageKey, function(data) {
    var order = data[storageKey];
    if (order) {
      sortable.sort(order);
    }
  });
};

var saveOrder = function (sortable) {
  if (SortableSaving) {
    return;
  }

  var storageKey = "apps-grid-services-order";
  var order = sortable.toArray();

  var data = {};
  data[storageKey] = order;

  SortableSaving = true;
  chrome.storage.sync.set(data, function() {
    SortableSaving = false;
  });
};

var initializeSortable = function () {
  if (SortableInstance) {
    SortableInstance.destroy();
    SortableInstance = null;
  }

  var list = getServiesList();
  if (list) {
    SortableInstance = Sortable.create(list, {
      dataIdAttr: "data-item-name",
      onSort: function () {
        saveOrder(this); // The `this` inside this function is the sortable instance.
      }
    });

    loadOrder(SortableInstance);
  }
};

document.addEventListener("DOMContentLoaded", function() {
  AppsGrid.GetEnabledAppsAndServices().then(function (result) {
    rebuildAppsMenu(result.apps);
    rebuildServicesMenu(result.services);
    initializeSortable();
  });

  document.getElementById("footer-more").onclick = function () {
    chrome.tabs.create({url: "chrome://extensions/?options=" + chrome.runtime.id });
  };
});

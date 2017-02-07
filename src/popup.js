var SortableInstance = null;
var SortableSaving = false;

var clearMenu = function () {
  var list = document.getElementById("list");
  if (list) {
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }
  }
};

var openService = function (serviceUrl) {
  chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
    var tab = tabs[0];
    if (tab && tab.url && tab.url.match(/chrome:\/\/newtab/)) {
      // Replace the current tab with the selected service if the current tab is the "new tab" tab
      chrome.tabs.update(tab.id, {url: serviceUrl});
    } else {
      // Open a new tab for the selected service if the current tab is not the "new tab" tab
      chrome.tabs.create({active: true, url: serviceUrl});
    }
  });

  // Close the extension popup
  window.close();
};

var getServiceElement = function (service) {
  var serviceInfo = AppsGrid.AllServices[service];
  if (!serviceInfo || !serviceInfo.label || !serviceInfo.url) {
    return null;
  }

  var element = document.createElement("li");
  element.id = "service-" + service;
  element.className = "service-item";
  element.setAttribute("data-service-name", service);

  var link = document.createElement("a");
  link.innerText = serviceInfo.label;
  link.onclick = function () {
    openService(serviceInfo.url);
  };

  element.appendChild(link);
  return element;
};

var rebuildMenu = function (services) {
  clearMenu();

  var list = document.getElementById("list");
  if (list) {
    for (var i = 0; i < services.length; i++) {
      var service = services[i];
      var element = getServiceElement(service);
      if (element) {
        list.appendChild(element);
      }
    }
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

  var list = document.getElementById("list");
  if (list) {
    SortableInstance = Sortable.create(list, {
      dataIdAttr: "data-service-name",
      onSort: function () {
        // The `this` inside this function is the sortable instance.
        saveOrder(this);
      }
    });

    loadOrder(SortableInstance);
  }
};

document.addEventListener("DOMContentLoaded", function() {
  AppsGrid.GetEnabledServices(function (services) {
    rebuildMenu(services);
    initializeSortable();
  });

  document.getElementById("footer-more").onclick = function () {
    chrome.tabs.create({url: "chrome://extensions/?options=" + chrome.runtime.id });
  };
});

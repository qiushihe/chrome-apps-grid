var SERVICES = {
  gmail:     {label: "Gmail",       url: "https://mail.google.com"},
  calendar:  {label: "Calendar",    url: "https://calendar.google.com"},
  keep:      {label: "Keep",        url: "https://keep.google.com"},
  hangouts:  {label: "Hangouts",    url: "https://hangouts.google.com"},
  drive:     {label: "Drive",       url: "https://drive.google.com"},
  photo:     {label: "Photo",       url: "https://photos.google.com"},
  play:      {label: "Play",        url: "https://play.google.com"},
  movies:    {label: "Movies & TV", url: "https://play.google.com/movies"},
  music:     {label: "Music",       url: "https://play.google.com/music"},
  games:     {label: "Games",       url: null},
  books:     {label: "Books",       url: "https://play.google.com/books"},
  newsstand: {label: "Newstand",    url: "https://play.google.com/newsstand"},
  store:     {label: "Store",       url: null},
  docs:      {label: "Docs",        url: "https://docs.google.com/document"},
  sheets:    {label: "Sheets",      url: "https://docs.google.com/spreadsheets"},
  slides:    {label: "Slides",      url: "https://docs.google.com/presentation"},
  forms:     {label: "Forms",       url: "https://docs.google.com/forms"},
  contacts:  {label: "Contacts",    url: "https://contacts.google.com"},
  maps:      {label: "Maps",        url: "https://www.google.com/maps"},
  youtube:   {label: "YouTube",     url: "https://www.youtube.com"},
  plus:      {label: "Google+",     url: "https://plus.google.com"},
  blogger:   {label: "Blogger",     url: "https://www.blogger.com"},
  news:      {label: "News",        url: "https://news.google.com"},
  account:   {label: "My Account",  url: "https://myaccount.google.com"},
  translate: {label: "Translate",   url: "https://translate.google.com"}
};

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
  // TODO: Don't open new tab if the current tab is the "new tab" tab
  chrome.tabs.create({active: true, url: serviceUrl});
};

var getServiceElement = function (service) {
  var serviceInfo = SERVICES[service];
  if (!serviceInfo || !serviceInfo.label || !serviceInfo.url) {
    return null;
  }

  var element = document.createElement("li");
  element.id = "service-" + service;
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
  var storageKey = sortable.options.group.name;
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

  var storageKey = sortable.options.group.name;
  var order = sortable.toArray();

  var data = {};
  data[storageKey] = order;

  SortableSaving = true;
  chrome.storage.sync.set(data, function() {
    SortableSaving = false;
  });
};

document.addEventListener("DOMContentLoaded", function() {
  rebuildMenu(["gmail", "calendar", "keep", "hangouts", "drive", "photo", "music"]);

  if (SortableInstance) {
    SortableInstance.destroy();
    SortableInstance = null;
  }

  var list = document.getElementById("list");
  if (list) {
    SortableInstance = Sortable.create(list, {
      group: "apps-grid-services",
      dataIdAttr: "data-service-name",
      onSort: function () {
        // The `this` inside this function is the sortable instance.
        saveOrder(this);
      }
    });

    loadOrder(SortableInstance);
  }
});

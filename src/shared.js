var AppsGrid = {
  AllServices: {
    gmail:     {id: "gmail", label: "Gmail",       url: "https://mail.google.com"},
    calendar:  {id: "calendar", label: "Calendar",    url: "https://calendar.google.com"},
    keep:      {id: "keep", label: "Keep",        url: "https://keep.google.com"},
    hangouts:  {id: "hangouts", label: "Hangouts",    url: "https://hangouts.google.com"},
    drive:     {id: "drive", label: "Drive",       url: "https://drive.google.com"},
    photo:     {id: "photo", label: "Photo",       url: "https://photos.google.com"},
    play:      {id: "play", label: "Play",        url: "https://play.google.com"},
    movies:    {id: "movies", label: "Movies & TV", url: "https://play.google.com/movies"},
    music:     {id: "music", label: "Music",       url: "https://play.google.com/music"},
    games:     {id: "games", label: "Games",       url: null},
    books:     {id: "books", label: "Books",       url: "https://play.google.com/books"},
    newsstand: {id: "newsstand", label: "Newstand",    url: "https://play.google.com/newsstand"},
    store:     {id: "store", label: "Store",       url: null},
    docs:      {id: "docs", label: "Docs",        url: "https://docs.google.com/document"},
    sheets:    {id: "sheets", label: "Sheets",      url: "https://docs.google.com/spreadsheets"},
    slides:    {id: "slides", label: "Slides",      url: "https://docs.google.com/presentation"},
    forms:     {id: "forms", label: "Forms",       url: "https://docs.google.com/forms"},
    contacts:  {id: "contacts", label: "Contacts",    url: "https://contacts.google.com"},
    maps:      {id: "maps", label: "Maps",        url: "https://www.google.com/maps"},
    youtube:   {id: "youtube", label: "YouTube",     url: "https://www.youtube.com"},
    plus:      {id: "plus", label: "Google+",     url: "https://plus.google.com"},
    blogger:   {id: "blogger", label: "Blogger",     url: "https://www.blogger.com"},
    news:      {id: "news", label: "News",        url: "https://news.google.com"},
    account:   {id: "account", label: "My Account",  url: "https://myaccount.google.com"},
    translate: {id: "translate", label: "Translate",   url: "https://translate.google.com"}
  },

  DefaultServices: ["gmail", "calendar", "keep", "hangouts", "drive", "photo", "music"],

  GetEnabledAreas: function () {
    return new Promise(function (resolve) {
      resolve(["apps", "services"]);
    });
  },

  GetAvailableApps: function () {
    return new Promise(function (resolve) {
      chrome.management.getAll(function (extensions) {
        resolve((extensions || []).filter(function (extension) {
          return extension.isApp && extension.enabled;
        }).reduce(function (result, app) {
          result[app.id] = {
            id: app.id,
            icons: app.icons,
            shortName: app.shortName
          };
          return result;
        }, {}));
      });
    });
  },

  GetEnabledApps: function () {
    var self = this;
    return new Promise(function (resolve) {
      self.GetAvailableApps().then(function (apps) {
        var allApps = JSON.parse(JSON.stringify(apps));
        var storageKey = "apps-grid-enabled-app";
        chrome.storage.sync.get(storageKey, function(data) {
          var appIds = data[storageKey];
          var enabledApps = [];
          (appIds || []).forEach(function (appId) {
            if (allApps[appId]) {
              enabledApps.push(allApps[appId]);
            }
          });
          resolve(enabledApps);
        });
      });
    });
  },

  GetAllApps: function () {
    var self = this;
    return new Promise(function (resolve) {
      self.GetAvailableApps().then(function (apps) {
        var allApps = JSON.parse(JSON.stringify(apps));
        self.GetEnabledApps().then(function (apps) {
          apps.forEach(function (app) {
            allApps[app.id].enabled = true;
          });
          resolve(Object.values(allApps));
        });
      });
    });
  },

  GetEnabledServices: function () {
    return new Promise(function (resolve) {
      var storageKey = "apps-grid-enabled-service";
      chrome.storage.sync.get(storageKey, function(data) {
        var serviceIds = data[storageKey];
        var hasServices = serviceIds && serviceIds.length > 0;
        var enabledServices = [];
        (hasServices ? serviceIds : AppsGrid.DefaultServices).forEach(function (serviceId) {
          if (AppsGrid.AllServices[serviceId]) {
            enabledServices.push(AppsGrid.AllServices[serviceId]);
          }
        })
        resolve(enabledServices);
      });
    });
  },

  GetAllServices: function () {
    var self = this;
    var allServices = JSON.parse(JSON.stringify(this.AllServices));

    return new Promise(function (resolve) {
      self.GetEnabledServices().then(function (services) {
        services.forEach(function (service) {
          allServices[service.id].enabled = true;
        });
        resolve(Object.values(allServices));
      });
    });
  }
};

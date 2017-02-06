var AppsGrid = {
  AllServices: {
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
  },

  DefaultServices: ["gmail", "calendar", "keep", "hangouts", "drive", "photo", "music"],

  GetEnabledServices: function (callback) {
    var storageKey = "apps-grid-enabled-services";
    chrome.storage.sync.get(storageKey, function(data) {
      var services = data[storageKey];
      if (!services || services.length <= 0) {
        callback(AppsGrid.DefaultServices);
      } else {
        callback(services);
      }
    });
  }
};

function fireEvent(el, type) {
  var e;
  if (document.createEvent) {
    e = document.createEvent("HTMLEvents");
    e.initEvent(type, true, true);
  } else {
    e = document.createEventObject();
    e.eventType = type;
  }

  e.eventName = type;

  if (document.createEvent) {
    el.dispatchEvent(e);
  } else {
    el.fireEvent("on" + e.eventType, e);
  }
}

function returnJson(url, obj) {
  jasmine.Ajax.stubRequest(url).andReturn({
    "status": 200,
    "contentType": 'application/javascript',
    "responseText": JSON.stringify(obj)
  });
}
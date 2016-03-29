+function(factory) {
  if (typeof define === 'function' && define.amd) {
    define('nytint-geoip', [], factory);
  } else {
    window.nytint_geoip = factory();
  }
}(function() {
  'use strict';

  var key = 'nyt-geoip',
      storage = sessionStorage, //|| localStorage
      stored_data = (storage) ? JSON.parse(storage.getItem(key)) : null,
      dom = document.getElementsByTagName('html'),
      //ajax
      ajax_req = new XMLHttpRequest(),
      results = null,
      //geoip response properties to promote
      property_whitelist = [
        'country_code',
        'region',
        'dma_code',
        'postal_code'
      ],
      //flag
      processed = false,
      fetch = null,
      decorate = null;

  fetch = function(callback) {
    //if local|sessionStorage, use it & get out early
    if (stored_data) {
      decorate(stored_data, callback);
      //return geoip response either way, for semi-API behavior
      return stored_data;
    }

    //otherwise, return XHR request results (not using jQuery on purpose)
    //success case
    ajax_req.onload = function(e) {
      var r = e.target,
          //IE handling
          ajax_data = (r.responseType === 'json') ? r.response.data : JSON.parse(r.responseText).message;
      decorate(ajax_data, callback);
      //return geoip response either way, for semi-API behavior
      return ajax_data;
    };
    //error case
    ajax_req.onreadystatechange = function () {
      if (this.readyState === 4 /*done*/ && this.status !== 200 /*success*/) { 
        console.error(this.status);
      }
    };
    //execution
    ajax_req.open('GET', 'http://geoip.newsdev.nytimes.com/', true);
    ajax_req.responseType = 'json';
    ajax_req.send();
  };

  decorate = function(geo_data, callback) {
    //nullcheck
    if (!dom) { console.error('HTML tag is missing?'); return false; }
    
    //store
    storage.setItem(key, JSON.stringify(geo_data));
    
    //data-attr decorate html tag
    if (!processed) {
      for (let i = 0, prop; prop = property_whitelist[i]; ++i) {
        var classed = ['geo', prop.replace('_code',''), geo_data[prop]].join('-');
        dom[0].classList.add(classed);
      }
      processed = true;
    }

    //call callback, if included
    if (typeof callback === 'function') {
      callback(geo_data);
    }

    return geo_data;
  };

  if (!window.NYTINT_TESTING) { fetch(); }
  //TODO: what was this case doing?
  // else {
  //   fetch.parseOptions = parseOptions;
  // }

  return fetch;

});
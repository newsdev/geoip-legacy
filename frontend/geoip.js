+function(factory) {
  if (typeof define === 'function' && define.amd) {
    define('nytint-geoip', ['jquery/nyt'], factory);
  } else {
    window.nytint_geoip = factory(window.jQuery, window._);
  }
}(function($) {
  'use strict';

  var key = 'nyt-geoip',
      storage = sessionStorage, //|| localStorage
      stored_data = (storage) ? JSON.parse(storage.getItem(key)) : null,
      dom = document.getElementsByTagName('html'),
      //api query
      query = {
        url: 'http://geoip.newsdev.nytimes.com/',
        dataType: 'json'
      },
      //geoip response properties to promote
      property_whitelist = [
        'country_code',
        'region',
        'dma_code',
        'postal_code'
      ],
      //flag
      processed = false,
      //functions
      fetch_data = null,
      run = null,
      complete = null;

  run = function() {
    //if local|sessionStorage, use it
    if (stored_data) {
      complete(stored_data);
      return stored_data;
    }
    //otherwise, return ajax request
    $.ajax(query) //TODO: use native
      .fail(function(error) { return {'status': 'geoip error'}; })
      .done(function(response) { complete(response.data); return response.data; });
  };

  complete = function(geo_data, callback) {
    if (!dom) { console.error('HTML tag is missing?'); return false; }
    //store
    storage.setItem(key, JSON.stringify(geo_data));
    
    //data-attr decorate <html>
    if (!processed) {
      for (let i = 0, prop; prop = property_whitelist[i]; ++i) {
        var label = 'geo-'+prop.replace('_code','');
        dom[0].setAttribute('data-'+label, geo_data[prop]);
      }
      processed = true;
    }

    //call callback, if included
    if (typeof callback === 'function') {
      callback(geo_data);
    }

    //return geoip response either way, for semi-API behavior
    return geo_data;
  };

  if (!window.NYTINT_TESTING) {
    run();
  }
  // else {
  //   run.parseOptions = parseOptions;
  // }

  return run;

});
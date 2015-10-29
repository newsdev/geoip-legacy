+function (factory) {
  if (typeof define === 'function' && define.amd) {
    define('nytint-geoip', ['jquery/nyt', 'underscore/nyt'], factory);
  } else {
    window.nytint_geoip = factory(window.jQuery, window._);
  }
}(function ($, _) {

    'use strict';

    /*
    Data attributes:
      geoip-match
        valid values:
          string codes consistent with values for specified data-geoip-match-on
      data-geoip-match-on
        valid values:
          area_code, city, continent_code, country_code, country_code3, country_name, dma_code, latitude, longitude, metro_code, postal_code, region, time_zone
      data-geoip-else
        valid values:
          jquery selector specifying the element(s) to show if specified match conditions are NOT met

    */

    var ready = function() {
          var dfd = new $.Deferred();
          $(document).ready(function() {
            var $elems = $('[data-geoip-match-on]');
            console.log('DOM QUEST', $elems.length);
            dfd.resolve($elems);
          });
          return dfd.promise();
        },

        fetch = function() {
          return $.ajax({
            url: 'http://geoip.newsdev.nytimes.com',
            dataType: 'json',
            success: function(reponse) {
              console.log('success', JSON.stringify(reponse));
            },
            error: function(reponse) {
              console.log('error', JSON.stringify(reponse));
            }
          });
        },

        complete = function(fetchArgs, $elems) {
          var geoipData = fetchArgs[0].data || {},
              cb;


          console.log('geoipData', JSON.stringify(geoipData), $elems.get(0).outerHTML);
          // by default hides elements that don't match, shows those that do.
          $elems.each(function() {
            var $this = $(this),
                match = _.map(($this.data('geoipMatch') || '').split(','), function(e) { return $.trim(e); }),
                matchOn = geoipData[$this.data('geoipMatchOn')],
                $else = $($this.data('geoipElse'));
            if (_.contains(match, matchOn)) {
              $this.show();
              $else.hide();
            } else {
              $this.hide();
              $else.show();
            }
          });
          while (queue.length > 0) {
            queue.shift()();
          }
        },

        run = function() {
          $.when(fetch(), ready()).done(complete);
        },

        queue = [];

        // run();

    return function(callback) {
      if (_.isFunction(callback)) {
        queue.push(callback);
      }
      run();
    };

});
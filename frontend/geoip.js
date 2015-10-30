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

    var qsOptions = _.reduce(window.location.search.slice(1).split('&'), function(memo, params) {
      var prefix = 'geoip_',
          parts;
      if (params.indexOf(prefix) === 0) {
        parts = params.split('=');
        memo[parts[0].replace(prefix, '')] = parts[1];
      }
      return memo;
    }, {});

    var geoip_cache,
        fetching = [],

        ready = function() {
          var dfd = new $.Deferred();
          $(document).ready(function() {
            dfd.resolve($('[data-geoip-match-on]'));
          });
          return dfd.promise();
        },

        queryApi = function(dfd) {
          $.ajax({
            url: 'http://geoip.newsdev.nytimes.com/',
            dataType: 'json',
            success: function(response) {
              geoip_cache = response.data;
              dfd.resolve(geoip_cache);
            },
            error: function() {
              dfd.reject('geoip service error');
            }
          });
        },

        fetch = function(forceRefresh) {
          var dfd = new $.Deferred(),
              promise = dfd.promise();

          if ((!geoip_cache && fetching.length == 0) || forceRefresh) {
            fetching.push(dfd);
            // return promise;
          } else if (geoip_cache) {
            dfd.resolve(geoip_cache);
            // return promise;
          } else {
            return fetching[fetching.length - 1].promise();
          }
          if (fetching.length > 0) {
            queryApi(fetching.shift());
          }
          return promise;
        },

        complete = function(geoipData, $elems) {
          geoipData = _.extend({}, geoipData || {}, qsOptions);
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
        },

        run = function(callback, forceRefresh) {
          $.when(fetch(forceRefresh), ready()).done(function(geoipData, $elems) {
            complete(geoipData, $elems);
            if (_.isFunction(callback)) {
              callback(geoipData, $elems);
            }
          });
        };

        if(!window.NYTINT_TESTING) {
          run();
        }

    return run;

});
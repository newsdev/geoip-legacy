require(['foundation/main'], function() {
  require(['jquery/nyt', 'underscore/nyt'], function($, _) {

    'use strict';

    var ready = function() {
          var dfd = new $.Deferred;
          $(document).ready(function() {
            dfd.resolve($('[data-geoip-match-on]'));
          });
          return dfd.promise();
        },

        fetch = function() {
          return $.ajax({
            url: 'http://geoip.newsdev.nytimes.com',
            success: function(response) {
              console.log(response);
            }
          });
        },
        complete = function(geoipData, $elems) {
          console.log(geoipData, $elems);
        };
    $.when(fetch(), ready()).done(complete);
  });
})
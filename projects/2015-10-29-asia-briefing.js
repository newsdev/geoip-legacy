/*! geoip_resolver 2015-10-30 */
+function(a){"function"==typeof define&&define.amd?define("nytint-geoip",["jquery/nyt","underscore/nyt"],a):window.nytint_geoip=a(window.jQuery,window._)}(function(a,b){"use strict";var c,d=b.reduce(window.location.search.slice(1).split("&"),function(a,b){var c,d="geoip_";return 0===b.indexOf(d)&&(c=b.split("="),a[c[0].replace(d,"")]=c[1]),a},{}),e=!1,f=function(){var b=new a.Deferred;return a(document).ready(function(){b.resolve(a("[data-geoip-match-on]"))}),b.promise()},g=function(b){var d=new a.Deferred,f=d.promise();return e?e:(!b&&c?d.resolve(c):(e=f,a.ajax({url:"http://geoip.newsdev.nytimes.com",dataType:"json",success:function(a){c=a.data,d.resolve(c),e=!1},error:function(){d.reject("geoip service error"),e=!1}})),f)},h=function(c,e){for(c=b.extend({},c||{},d),e.each(function(){var d=a(this),e=b.map((d.data("geoipMatch")||"").split(","),function(b){return a.trim(b)}),f=c[d.data("geoipMatchOn")],g=a(d.data("geoipElse"));b.contains(e,f)?(d.show(),g.hide()):(d.hide(),g.show())});j.length>0;)j.shift()(c,e)},i=function(b){a.when(g(b),f()).done(h)},j=[];return i(),function(a,c){b.isFunction(a)&&j.push(a),i(c)}});

require(['foundation/main'], function() {
  require(['nytint-geoip', 'jquery/nyt'], function(geoip, $) {
    geoip(function(geoipData, $elems) {
      var $asia;
      if (!geoipData.country_code && geoipData.continent_code == 'AS') {
        $asia = $elems.filter('.nythpAsiaBriefingTest-Asia');
        $asia.show();
        $($asia.data('geoipElse')).hide();
      }
    });
  });
});
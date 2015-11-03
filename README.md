# Geoip

## Description

A simple, Node-based service for providing geolocation data based on a user's IP address.  Backed by the MaxMind DB.  Also includes a JavaScript plugin for querying the service and handling the response.

* [Features](#features)
* [Requirements](#requirements)
* [Support](#support)
* [Installation](#installation)
* [Usage](#usage)
* [Tests](#tests)
* [Upcoming Features](#upcoming-features)
* [Other Relevant Documentation](#other-relevant-documentation)
* [License](#license)

## Features

* Capable of handling homepage traffic

## Requirements

* TK

## Support

*The Node portion of this project was written by Eric Buth.  The JS plugin was written by Scott Blumenthal.  Please feel free to add issues to this repo on Github.*

## Installation

JavaScript dependencies must be installed via NPM:

```
npm install
```

## Usage

### Client-side JS

#### How to Include the JS

This plugin is intended to be used on NYT5 pages, and will require (via RequireJS) jQuery and Underscore accordingly.  It can also be used in a non-RJS environment, but will expect jQuery and Underscore to exist on the `window` object.

At the moment, we are not publishing static, versioned files for inclusion anywhere.  There is, however, a minified version of the script checked in to the repository [here](https://github.com/newsdev/geoip/blob/master/dist/geoip.min.js).  To use it, add the minified code within a script tag in the relevant freeform or interactive for your project.

The script itself defines but does not *require* an AMD module, so to trigger its default behavior, add a line requiring the module:

For example:

```js
<script type="text/javascript">
/*! geoip_resolver 2015-11-03 */
+function(a){"function"==typeof define&&define.amd?define("nytint-geoip",["jquery/nyt","underscore/nyt"],a):window.nytint_geoip=a(window.jQuery,window._)}(function(a,b){"use strict";var c,d=[],e=function(a){return b.reduce(a.split("&"),function(a,b){var c,d="geoip_";return 0===b.indexOf(d)&&(c=b.split("="),a[c[0].replace(d,"")]=c[1]),a},{})},f=e(window.location.search.slice(1)),g=function(){var b=new a.Deferred;return a(document).ready(function(){b.resolve(a("[data-geoip-match-on]"))}),b.promise()},h=function(b){a.ajax({url:"http://geoip.newsdev.nytimes.com/",dataType:"json",success:function(a){c=a.data,b.resolve(c)},error:function(){b.reject("geoip service error")}})},i=function(b){var e=new a.Deferred,f=e.promise();if(!c&&0===d.length||b)d.push(e);else{if(!c)return d[d.length-1].promise();e.resolve(c)}return d.length>0&&h(d.shift()),f},j=function(c,d,g){return g=b.isString(g)?e(g):b.isObject(g)?g:f,c=b.extend({},c||{},g),d.each(function(){var d=a(this),e=b.map((d.data("geoipMatch")||"").split(","),function(b){return a.trim(b)}),f=c[d.data("geoipMatchOn")],g=a(d.data("geoipElse"));b.contains(e,f)?(d.show(),g.hide()):(d.hide(),g.show())}),c},k=function(c,d,e){a.when(i(d),g()).done(function(a,d){var f=j(a,d,e);b.isFunction(c)&&c(f,d)})};return window.NYTINT_TESTING?k.parseOptions=e:k(),k});

require(['foundation/main'], function() {
  require(['nytint-geoip'], {});
});
```

Use the same basic format to add your own custom logic for handling the response from our geoip service:

```js
require(['foundation/main'], function() {
  require(['nytint-geoip'], function(onGeoLocate) {
    onGeoLocate(function(geoipData, taggedElements) {
      taggedElements.each(function() {
        if ($(this).hasClass('usa') && geoipData.country_code == 'US') {
          $(this).css('border-color', 'redwhiteandblue');
        }
      });
    });
  });
});
```

#### Default behavior

When the client-side script is instantiated on the page, it will automatically try to apply default behaviors to elements with a `data-geoip-match-on` attribute.  The value of that attribute specifies which geoip attribute to try to match against.  The accompanying `data-geoip-match` attribute should contain the value or values you are trying to match.  Elements that meet the criteria will be displayed by default, regardless of their initial state, and elements that do not will be hidden.  For a response from the geoip service that looks like this:

```js
{
  "response": true,
  "data":{
    "country_code":"US",
    "country_code3":"USA",
    "country_name":"United States",
    "region":"NY",
    "city":"New York",
    "postal_code":"10018",
    "latitude":40.75529861450195,
    "longitude":-73.99240112304688,
    "metro_code":501,
    "dma_code":501,
    "area_code":212,
    "continent_code":"NA",
    "time_zone":"America/New_York"
  },
  "status":"ok"
}
```

the following will be true:

```html
<div data-geoip-match-on="country_code" data-geoip-match="US">I will show.</div>
<div data-geoip-match-on="country_code" data-geoip-match="US, CA, TM">I will also show.</div>

<div data-geoip-match-on="country_code" data-geoip-match="VA">I will be hidden.</div>

<div data-geoip-match-on="region" data-geoip-match="NY">
  <p>This will be visible</p>
  <p data-geoip-match-on="city" data-geoip-match="New York">And so will this.<p>
  <p data-geoip-match-on="city" data-geoip-match="Stony Point">But not this.<p>
</div>

<div data-geoip-match-on="longitude" data-geoip-match="-73.99240112304688">Will show too.</div>
```

If you want the visibilty of one element to always be the inverse of another's (depending on the criteria defined for the latter), you can point to the former using the `data-geoip-else` attribute and using a valid jQuery selector as the value.  So for a response

```js
{
  "response": true,
  "data":{
    ...
    "country_code":"CA"
    ...
  },
  "status":"ok"
}
```

the following will be true:

```html
<div id="everyone-else">I will end up hidden</div>
<div data-geoip-match-on="country_code" data-geoip-match="CA" style="display: none" data-geoip-else="#everyone-else">I will be shown.</div>
```


## Tests

*Are there tests?  How do I run them?*

## Upcoming Features

*What are you working on next?  Are there milestones in the Github issues worth referencing?*

## Other Relevant Documentation

*Links here to external documentation that might help someone using or developing in this project.  For example:*

* [Bower](http://bower.io) - A package manager for the web
* [jQuery](https://jQuery.com) - You'd better know by now

## License

*Include and licence information here.*
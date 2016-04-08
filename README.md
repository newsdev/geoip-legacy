# GeoIP

## Description

A simple, Node-based service for providing geolocation data based on a user's IP address.  Backed by the MaxMind DB.  Also includes a JavaScript plugin for querying the service and handling the response.

* [Features](#features)
* [Requirements](#requirements)
* [Support](#support)
* [Installation](#installation)
* [Usage](#usage)
    * [Geoip Service](#geoip-service)
    * [Client-side JS](#client-side-js)
* [Other Relevant Documentation](#other-relevant-documentation)
* [License](#license)

## Features

* Capable of handling homepage traffic
* Works with and without RequireJS
* Decorates `<html>` tag with `geo-`patterned classes, like Modernizr and NYT5
* Enables CSS fairly complex display rules for states before/after class logic
* Pretty fast

## Support

Please add [Issues to this repo on Github](https://github.com/newsdev/geoip/issues/new).

## Local Development

### Client-side JS

#### Local development

JavaScript dependencies must be installed via NPM:

```
npm install
```

Changes should be made to `frontend/geoip.js`.

~~Please add tests to `frontend/spec/geoipSpec.js`~~ (Tests currently not working).

#### Publishing

Minify your latest version of the script by running `grunt uglify`.

Once you have uglified the script, upload it to `https://int.nyt.com/applications/geoip/geo.min.js` or `http://int.stg.nyt.com/applications/geoip/geo.min.js`.  

To upload it, run `rake publish DEPLOY_HOST=[int.nyt.com or int.stg.nyt.com] AWS_CONFIG_PATH=[keys]`.

For details about the keys, see the documentation in [Preview](http://newsdev.ec2.nytimes.com/preview/2016-03-21-geoip-examples/master/) [NYT ONLY].

#### Tests

~~The Jasmine tests can be run via PhantomJS using grunt: `grunt jasmine`.~~ (Tests currently not working).

## Server


#### On OS X

Since the server requires GNU tar, you'll likely find it easiest to develop locally on OS X by building and then running a docker image:

```
docker build -t geoip . && docker run -p 80:80 -e MAXMIND_LICENSE=... -e ORIGIN_RE="/^https?:\/\/([\w-]+\.)*yourdomain\.com(:\d+)?$/" geoip
```

To develop locally against your docker image, ping your locally running service like this:

`curl -vv -H "Origin: http://www.nytimes.com" [your_docker_image_IP]:80/?ip=170.149.100.10`

You should then get a response like

`{"response":true,"data":{"country_code":"US","country_code3":"USA","country_name":"United States","region":"NY","city":"New York","postal_code":"10018","latitude":40.75529861450195,"longitude":-73.99240112304688,"metro_code":501,"dma_code":501,"area_code":212,"continent_code":"NA","time_zone":"America/New_York","zone_abbr":"ET"},"status":"ok"}`

For more details and deployment steps for the server image, [check out the DevOps wiki](https://github.com/newsdev/devops/wiki/Geoip) [NYT only].  

#### On other platforms

Run `npm start`.

## Usage

### Client-side JS

#### How to Include the JS

This plugin is intended to be used on NYT5 pages, and has a RequireJS module variant.  It can also be used in a non-RJS environment. 

The script itself defines but does not *require* an AMD module, so to initialize it you need to require the module:

For example:

```html
<script type="text/javascript" src="https://int.nyt.com/applications/geoip/geo.min.js"></script>
<script type="text/javascript">
(function() { require(['nytint-geoip']); })();
</script>
```

Use the same basic format to add your own custom logic for handling the response from our geoip service:

```html
<script type="text/javascript" src="https://int.nyt.com/applications/geoip/geo.min.js"></script>
<script type="text/javascript">
(function() {
  require(['nytint-geoip'], function(geoip) { 
    geoip(handler);
  });
  var handler = function(d) {
    console.log('lat/lon',d.latitude, d.longitude);
  };
})();
</script>
```

#### Default behavior

When the client-side script is instantiated on the page, it will automatically apply a subset of geocoded data as classes to the `html` tag.  Styles can then be written to show/hide elements depending on geolocation per session.  

For a response from the geoip service that looks like this:

```json
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

the following will use it to control content options:

```html
<style>
  /*default display conditions*/
  .story[data-story-id="100000004295572"] {display: block;}
  .story[data-story-id="100000004295573"] {display: none;}
  /*geocoded display conditions*/
  html.geo-dma-501 [data-story-id="100000004295572"] {display: none;}
  html.geo-dma-501 [data-story-id="100000004295573"] {display: block;}
</style>
<div class="story" data-story-id="100000004295572">I will be shown for other readers.</div>
<div class="story" data-story-id="100000004295573">I will show for readers in the NYC DMA.</div>
<script type="text/javascript" src="https://int.nyt.com/applications/geoip/geo.min.js"></script>
<script type="text/javascript">
(function() {
  require(['nytint-geoip']);
})();
</script>
```

If you want the visibilty of one element to always be the inverse of another's (depending on the criteria defined for the latter), you can show/hide content with `:not()` rules within your CSS.

```html
<style>
  /*default display conditions*/
  .story[data-story-id="100000004295574"],
  .story[data-story-id="100000004295575"],
  .story[data-story-id="100000004295576"] {display: none;}
  /*geocoded display conditions*/
  html.geo-region-NY [data-story-id="100000004295574"],
  html.geo-region-VA [data-story-id="100000004295575"],
  html:not(.geo-region-KS) [data-story-id="100000004295576"] {display: block;}
</style>
<div class="story" data-story-id="100000004295574">I will show for readers in NYC.</div>
<div class="story" data-story-id="100000004295575">I will be hidden for readers in NYC.</div>
<div class="story" data-story-id="100000004295576">I will show for readers not in Kansas.</div>
<script type="text/javascript" src="https://int.nyt.com/applications/geoip/geo.min.js"></script>
<script>
(function() { 
  require(['nytint-geoip']);
})();
</script>
```

## Other Relevant Documentation

*Links here to external documentation that might help someone using or developing in this project.  For example:*

* [Jasmine](http://jasmine.github.io/2.3/introduction.html) - A behavior-driven development framework for testing JavaScript code


## License

*Include and licence information here.*
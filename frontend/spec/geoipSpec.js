describe("geoip client-side plugin", function() {
  
  var GEOIP_URL = 'http://geoip.newsdev.nytimes.com/',
      $content = $('<div></div>').appendTo('body'),
      add = function(opts) {
        var attrs = _.map(opts || {}, function(k, v) {
              return 'data-geoip-' + v + '=' + k;
            }),
            $elem = $('<div ' + attrs.join(' ') + '></div>');
        $content.append($elem);
        return $elem;
      },
      mockFetch = function(response) {
        returnJson(GEOIP_URL, { data: response });
      };

  beforeEach(function() {
    jasmine.Ajax.install();
  });

  afterEach(function() {
    $content.empty();
    jasmine.Ajax.uninstall();
  });

  it("exposes a function", function() {
    expect(_.isFunction(nytint_geoip)).toBe(true);
  });

  it("callbacks passed to the exposed function will be passed the geoip response data, and a $ set of qualifying elements", function(done) {
    var $e1 = add({
          'match-on': 'country_code',
          'match': 'UK'
        }),
        $e2 = add({
          'match-on': 'continent_code',
          'match': 'AS'
        }),
        response = { country_code: 'UK' };

    mockFetch({ country_code: 'UK' });

    nytint_geoip(function(data, $elems) {
      expect(data).toEqual(response);
      expect($elems.length).toEqual(2);
      expect($elems.get(0)).toEqual($e1.get(0));
      expect($elems.get(1)).toEqual($e2.get(0));
      done();
    }, true);
  });

  it("caches the results of the geoip call rather than making the request each time unless forced to refresh", function(done) {
    mockFetch({ country_code: 'UK' });
    
    nytint_geoip(function() {
      expect(jasmine.Ajax.requests.at(0).url).toBe('http://geoip.newsdev.nytimes.com/');
    }, true);

    nytint_geoip(function() {
      expect(jasmine.Ajax.requests.at(1)).toBeUndefined();
    });

    nytint_geoip(function() {
      expect(jasmine.Ajax.requests.at(1).url).toBe('http://geoip.newsdev.nytimes.com/');
      done();
    }, true);
  });

  // it("shows a hidden element if geoip-match satisfies geoip-match-on", function() {
  //   var $e1 = add({
  //         'match-on': 'country_code',
  //         'match': 'UK'
  //       });
    
  //   mockFetch({ country_code: 'UK' });

  //   $e1.hide();

  //   nytint_geoip(function() {
  //     expect($e1.css('display')).not.toBe('none');
  //   }, true);
  // });

  // it("hides a visible element if geoip-match does not satisfies geoip-match-on", function() {
  //   var $e1 = add({
  //         'match-on': 'country_code',
  //         'match': 'UK'
  //       });
    
  //   mockFetch({ country_code: 'US' });

  //   nytint_geoip(function() {
  //     expect($e1.css('display')).toBe('none');
  //   }, true);
  // });

  
});
describe("geoip client-side functionality", function() {
  
  var $content = $('<div></div>').appendTo('body'),
      add = function(opts) {
        var attrs = _.map(opts || {}, function(k, v) {
              return 'data-geoip-' + v + '=' + k;
            }),
            $elem = $('<div ' + attrs.join(' ') + '></div>');
        $content.append($elem);
        console.log('added' + $elem.get(0).outerHTML);
        return $elem;
      },
      mockFetch = function(response) {
        returnJson('http://geoip.newsdev.nytimes.com', { data: response });
      };

  beforeEach(function() {
    jasmine.Ajax.install();
  });

  afterEach(function() {
    console.log('empty!!!');
    $content.empty();
    jasmine.Ajax.uninstall();
  });

  it("shows a hidden element if geoip-match satisfies geoip-match-on", function() {
    var $e1 = add({
          'match-on': 'country_code',
          'match': 'UK'
        });
    
    mockFetch({ country_code: 'UK' });

    $e1.hide();

    nytint_geoip(function() {
      expect($e1.css('display')).not.toBe('none');
    });
  });

  it("hides a visible element if geoip-match does not satisfies geoip-match-on", function() {
    var $e1 = add({
          'match-on': 'country_code',
          'match': 'UK'
        });
    
    mockFetch({ country_code: 'US' });

    nytint_geoip(function() {
      expect($e1.css('display')).toBe('none');
      // done();
    });
  });

  
});
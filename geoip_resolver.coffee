geoip = require 'geoip'
http = require 'http'
url = require 'url'
fs = require 'fs'
zlib = require 'zlib'

lookup = false

http.get {
    hostname: 'download.maxmind.com'
    path: "/app/download_new?edition_id=133&suffix=tar.gz&license_key=#{process.env.MAXMIND_LICENSE}"
  }, (response) ->

  tarfile = fs.createWriteStream './GeoIPCity.tar.gz'

  response.on 'data', (chunk) ->
    tarfile.write chunk, encoding: 'binary'

  response.on 'end', (res) ->
    require('child_process').exec "tar -xzOf GeoIPCity.tar.gz --wildcards '*/GeoIPCity.dat' > GeoIPCity.dat", (err) ->
      throw err if err
      lookup = new geoip.City './GeoIPCity.dat'
      console .log "lookup set"

      server = http.createServer (request, res) ->
        
        # No request is cachable
        res.setHeader 'Vary', '*'

        switch

          when request.url == "/status"
            res.setHeader 'Content-Type', 'text/plain'
            res.write 'ok'

          when request.headers['referer'] and request.headers['referer'].match(/^http:\/\/([\w-]+\.)*nytimes\.com\//)

            responseObj = {
              response: true
            }

            # Parse the URL
            parsed = url.parse request.url, true

            # Check if the lookup is ready
            if lookup

              # Start with the source IP
              ip = request.connection.remoteAddress

              # Check for an IP provided as a parameter
              if parsed['query']['ip']
                ip = parsed['query']['ip']
              
              # Otherwise handle proxied connections
              else if request.headers['x-forwarded-for']
                ip = request.headers['x-forwarded-for'].split(/,\s+/)[0]
              
              # Run the actual lookup
              citydata = lookup.lookupSync ip

              # Insure there was a valid response
              if citydata
                responseObj.data = citydata
                responseObj.status = 'ok'
                res.statusCode = 200;
              else
                responseObj.status = 'error'
                res.statusCode = 500;
            
            # Handle the lookup not being ready
            else
              responseObj.status = 'error'
              res.statusCode = 500;
              
            # Stringify the results
            responseObjString = JSON.stringify responseObj
            
            # Check if a callback was specified
            if parsed['query']['callback']
              res.setHeader 'Content-Type', 'application/javascript'
              res.write "#{parsed['query']['callback'].replace(/\W/g, '') || 'callback'}(#{responseObjString});"
            else
              res.setHeader 'Content-Type', 'application/json'
              res.write responseObjString

          else
            res.statusCode = 401;
            res.setHeader 'Content-Type', 'text/plain'
            res.write 'unauthorized'

        res.end()

      server.listen 80, ->
        console.log "server listening on :80"
        
.on 'error', (err) ->
  throw err


geoip = require 'geoip'
http = require 'http'
url = require 'url'
fs = require 'fs'
zlib = require 'zlib'
moment = require 'moment'

throw "You must supply a ORIGIN_RE ENV var!" if !process.env.ORIGIN_RE?
origin_re = new RegExp process.env.ORIGIN_RE

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
      console .log "lookup service ready v1.1"

      server = http.createServer (request, res) ->
        
        # No request is cachable
        res.setHeader 'Vary', '*'

        switch

          when request.url == "/status"
            res.setHeader 'Content-Type', 'text/plain'
            res.write 'ok'

          when request.headers['origin'] and origin_re.test(request.headers['origin'])

            res.setHeader 'access-control-allow-origin', request.headers['origin']

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
                citydata.tz = citydata.time_zone
                # add abbreviated timezone if in the U.S.
                if citydata && citydata.time_zone.indexOf('America/') >= 0
                  citydata.tz = moment.zoneAbbr(citydata.time_zone).replace(/(?:S|D)/,'')
                  console .log "has timezone"
                  console .log citydata.tz
                
                #lookup fips
                console .log "has citydata"
                # TODO
                
                # finalize as response
                responseObj.data = citydata
                responseObj.status = 'ok'
                res.statusCode = 200;
              else
                responseObj.status = 'not found'
                res.statusCode = 200;
            
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
        console .log "server listening on :80"

.on 'error', (err) ->
  throw err



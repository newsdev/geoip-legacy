geoip = require 'geoip'
http = require 'http'
https = require 'https'
url = require 'url'
fs = require 'fs'
zlib = require 'zlib'
moment = require 'moment'
moment_timezone = require 'moment-timezone'

throw "You must supply a ORIGIN_RE ENV var!" if !process.env.ORIGIN_RE?
throw "You must supply a MAXMIND_DATABASE_URL ENV var!" if !process.env.MAXMIND_DATABASE_URL?
origin_re = new RegExp process.env.ORIGIN_RE

lookup = false

https.get process.env.MAXMIND_DATABASE_URL, (response) ->

  tarfile = fs.createWriteStream './GeoIPCity.tar.gz'

  response.on 'data', (chunk) ->
    tarfile.write chunk, encoding: 'binary'

  response.on 'end', (res) ->
    require('child_process').exec "tar -xzOf GeoIPCity.tar.gz --wildcards '*/GeoIPCity.dat' > GeoIPCity.dat", (err) ->
      throw err if err

      #maxmind lookup
      lookup = new geoip.City './GeoIPCity.dat'
      
      #lookup fips
      fipsfile = fs.readFileSync 'data/fips.csv', "utf8"
      zips = fipsfile.split("\n")
      fips = {}
      zips.map (fip) ->
        f = fip.split(',')
        fips[f[0]] = { state: f[1], county: f[2], geoid: f[3].replace(/\r/,'') }

      #command-line debugging/versioning
      console .log "lookup service ready v0.0.375"
      
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

              # Ensure there was a valid response
              if citydata

                # add abbreviated timezone when in the U.S.
                if citydata.time_zone.match(/^America\//)
                  full_abbr = moment_timezone.tz(citydata.time_zone).zoneAbbr()
                  citydata.zone_abbr = full_abbr.replace(/(?:S|D)/,'')
                
                # add the matching fips codes for the postal code in the US
                if citydata.country_code == 'US'
                  zip_to_fips = fips[citydata.postal_code]
                  citydata.fips_state = zip_to_fips.state
                  citydata.fips_county = zip_to_fips.county
                  citydata.fips_geoid = zip_to_fips.geoid

                #mark intranet/extranet
                citydata.intranet = false
                
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



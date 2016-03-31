gem 'aws-sdk', '< 2'
gem 's3-publisher', '0.9.2'
require 'aws-sdk'
require 's3-publisher'

desc "Publishes minified/uglified JS asset to CDN."
task :publish do
  puts "Pubishing minified and uglified script to #{ENV["DEPLOY_HOST"]}."

  #The file 'aws.yml' was not found.
  #Create this file and place proper AWS credentials inside of it.
  AWS.config(YAML.load(File.read(File.expand_path(ENV['AWS_CONFIG_PATH']))))
  data = File.read(File.join(Rake.original_dir, 'dist', 'geoip.min.js'))

  S3Publisher.publish(ENV["DEPLOY_HOST"]) do |p|
    #86400 = 1 day | 259200 = 3 days | 604800 = 7 days
    p.push('applications/geoip/geo.min.js', data: data, ttl: 86400) 
  end

  puts "Published."
end
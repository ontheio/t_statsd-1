var util = require('util'), http = require('http'), url = require('url'), querystring = require('querystring'), md5 = require('MD5');

var api_id, api_key;

function TBackend(startupTime, config, emitter){
  var self = this;
  this.lastFlush = startupTime;
  this.lastException = startupTime;
  api_id = config.t.id;
  api_key = config.t.key;

  emitter.on('flush', function(timestamp, metrics) { self.flush(timestamp, metrics); });
  emitter.on('status', function(callback) { self.status(callback); });
}

TBackend.prototype.flush = function(timestamp, metrics) {
  var data = '';
  for ( var m in metrics.counters ) if ( metrics.counters[m] ) data += '?k=' + api_id + ':' + m + '&v=' + metrics.counters[m] + '&s=' + md5(api_id + ':' + m + api_key) + " ";
  for ( var m in metrics.gauges ) data += '?k=' + api_id + ':' + m + '&v==' + metrics.gauges[m] + '&s=' + md5(api_id + ':' + m + api_key) + " ";
  if ( !data.length ) return;

  var options = url.parse('http://tapi.onthe.io/');
  options.method = 'POST';
  options.headers = {
	'Content-Length': data.length,
	'Content-Type': "application/x-www-form-urlencoded"
  };

  var req = http.request(options, function(res) {
    res.setEncoding('utf8');
  });

  req.write(data);
  req.end();
};

TBackend.prototype.status = function(write) {
  ['lastFlush', 'lastException'].forEach(function(key) {
    write(null, 't', key, this[key]);
  }, this);
};

exports.init = function(startupTime, config, events) {
  var instance = new TBackend(startupTime, config, events);
  return true;
};

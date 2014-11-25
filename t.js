var util = require('util'), https = require('https'), url = require('url'), querystring = require('querystring'), md5 = require('MD5');

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
  for ( var m in metrics.counters ) if ( m.indexOf('statsd') == -1 ) if ( metrics.counters[m] ) data += '?k=' + api_id + ':' + resolve_metric(m) + '&v=' + metrics.counters[m] + '&s=' + md5(api_id + ':' + resolve_metric(m) + api_key) + " ";
  for ( var m in metrics.gauges ) if ( m.indexOf('statsd') == -1 ) data += '?k=' + api_id + ':' + resolve_metric(m) + '&v==' + metrics.gauges[m] + '&s=' + md5(api_id + ':' + resolve_metric(m) + api_key) + " ";
  if ( !data.length ) return;

  send_t_data(data, 0);
};

function resolve_metric(m) {
        return new Buffer(m, 'base64').toString('ascii');
}

function send_t_data(data, tries) {
  if ( tries >= 5 ) throw 'Failed to send data to t';
  tries++;

  console.log('Sending data to t, attempt ' + tries);

  try
  {
    var options = url.parse('https://tapi.onthe.io/');

    options.method = 'POST';
    options.headers = {
        'Content-Length': data.length,
        'Content-Type': "application/x-www-form-urlencoded"
    };

    var req = https.request(options, function(res) {
      if ( res.statusCode != 200 ) setTimeout(function() { send_t_data(data, tries); }, 1000 * tries);
    });

    req.on('error', function(errdata) {
      setTimeout(function() { send_t_data(data, tries); }, 1000 * tries);
    });

    req.write(data);
    req.end();
  }
  catch ( e )
  {
    console.log(e);
    setTimeout(function() { send_t_data(data, tries); }, 1000 * tries);
  }
}

TBackend.prototype.status = function(write) {
  ['lastFlush', 'lastException'].forEach(function(key) {
    write(null, 't', key, this[key]);
  }, this);
};

exports.init = function(startupTime, config, events) {
  var instance = new TBackend(startupTime, config, events);
  return true;
};

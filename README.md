t_statsd
========

https://t.onthe.io http backend for statsd.
How to use:

- create t.onthe.io account
- obtain API id and key
- download t.js backend and copy it into statsd/backends folder
- edit statsd/config.js:
```
{
  port: 8125
  , flushInterval: 1000
  , backends: ['./backends/t']
  , t: {id: 1, key: 'asdkjasd'}
}
```

- Restart statsd.

t_statsd
========

https://t.onthe.io http backend for statsd

How to use:

1. create t.onthe.io account
2. obtain API id and key
3. download t.js backend and copy it into statsd/backends folder
4. edit statsd/config.js properly:
```
{
  port: 8125
  , flushInterval: 1000
  , backends: ['./backends/t']
  , t: {id: 1, key: 'asdkjasd'}
}
```

Restart statsd.

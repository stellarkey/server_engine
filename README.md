# server_engine
 server_engine for [`qqshare`](https://github.com/stellarkey/qingqingshare).

> MySQL pre-installation is required.

# Usage

```
node server.js
```

Specify port number:

```
node server.js --port=8023
```

## Search

`http://localhost:8081/api/search?filename=XXX&course=YYY&teacher=ZZZ`

- server: `http://localhost`
- port number: `8081`
- quest matcher: `/api/search`
- quest parameters:
  - `filename=XXX`
  - `course=YYY`
  - `teacher=ZZZ`

# server_search_engine
 server_search_engine for `qqshare`.

# Usage

```
node server.js
```

Specify port number:

```
node server.js --port=8023
```

## Search

`http://localhost:8011/qqshare_search?filename=XXX&course=YYY&teacher=ZZZ`

- server: `http://localhost`
- port number: `8011`
- quest matcher: `/qqshare_search`
- quest parameters:
  - `filename=XXX`
  - `course=YYY`
  - `teacher=ZZZ`

> Example URL：`http://localhost:8011/qqshare_search?filename=%E7%BB%84%E5%90%88%E6%95%B0%E5%AD%A6&course=%E7%BB%84%E5%90%88%E6%95%B0%E5%AD%A6&teacher=%E9%A9%AC%E6%98%B1%E6%98%A5`
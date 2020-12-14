// 测试查询链接：
// http://localhost:8011/api/search?filename=%E7%BB%84%E5%90%88%E6%95%B0%E5%AD%A6&course=%E7%BB%84%E5%90%88%E6%95%B0%E5%AD%A6&teacher=%E9%A9%AC%E6%98%B1%E6%98%A5
// 测试插入链接：（自行）

// 命令行：node server.js --port=8023  可自定义端口
const args = require('minimist')(process.argv.slice(2));
var port_number= args['port'] ? args['port'] : 8011; // 端口号

var express = require('express');
var app = express();
 
app.get('/api/search', function (req, res) {

  console.log(req.query);
  //console.log(req.query.filename);
  //res.send(req.query.filename);

  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '123456',
    database : 'qqshare'
  });

  connection.connect();

  var filename_filter = req.query.filename ? req.query.filename : " ";
  var course_filter = req.query.course ? req.query.course : " ";
  var teacher_filter = req.query.teacher ? req.query.teacher : " ";
  // if it's empty, then use: " " (with a space)

  var SQL_query = 'SELECT * FROM qqshare_info WHERE filename REGEXP "'
              + filename_filter 
              + '" OR course REGEXP "' 
              + course_filter 
              + '" OR teacher REGEXP "'
              + teacher_filter
              + '";';

  connection.query(SQL_query, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    //console.log('The solution is: ', results[0].filename);
    res.send(results);
  });

  connection.end();
})



// magnetURL中有特殊字符，可能需要转义：
// https://segmentfault.com/a/1190000009492789
app.get('/api/upload', function (req, res) {
  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '123456',
    database : 'qqshare'
  });

  connection.connect();

  var filename = req.query.filename ? req.body.filename : " ";
  var course = req.query.course ? req.query.course : " ";
  var teacher = req.query.teacher ? req.query.teacher : " ";
  var filesize = req.query.filesize ? req.query.filesize : 1024;
  var uploadtime = req.query.uploadtime ? req.query.uploadtime : " ";
  var fileformat = req.query.fileformat ? req.query.fileformat : " ";
  var magnetURL = req.query.magnetURL ? req.query.magnetURL : " ";

  var addSql = 'INSERT INTO qqshare_info (filename,course,teacher,filesize,uploadtime,fileformat,magnetURL) VALUES(?,?,?,?,?,?,?)';
  var addSqlParams = [filename,course,teacher,filesize,uploadtime,fileformat,magnetURL];

  connection.query(addSql,addSqlParams,function (err, result) {
    if(err){
    console.log('[INSERT ERROR] - ',err.message);
    return;
    }

    console.log('--------------------------INSERT----------------------------');
    //console.log('INSERT ID:',result.insertId);        
    console.log('INSERT ID:',result);        
    console.log('-----------------------------------------------------------------\n\n');
    res.send(result);
  });

  connection.query("SELECT * FROM qqshare_info;",function (err, result) {
    if(err){
      console.log('[SELECT ERROR] - ',err.message);
      return;
    }

    // console.log('--------------------------SELECT----------------------------');
    // console.log(result);
    // console.log('------------------------------------------------------------\n\n');  
  });

  connection.end();
})

app.post('/api/uservalid', function (req, res) {
  console.log("主页 POST 请求");
  console.log(req);
  res.send("QAQ");
  console.log("-------------");
  
})




var server = app.listen(port_number, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("QQShare is running at http://%s:%s", host, port)
 
})
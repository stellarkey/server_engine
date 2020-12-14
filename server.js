// 测试查询链接：
// http://localhost:8011/api/search?filename=%E7%BB%84%E5%90%88%E6%95%B0%E5%AD%A6&course=%E7%BB%84%E5%90%88%E6%95%B0%E5%AD%A6&teacher=%E9%A9%AC%E6%98%B1%E6%98%A5
// 测试插入链接：（自行）

// 命令行：node server.js --port=8023  可自定义端口
const args = require('minimist')(process.argv.slice(2));
var port_number= args['port'] ? args['port'] : 8011; // 端口号

var express = require('express');
var querystring = require('querystring');
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
app.post('/api/upload', function (req, res) {
  

  var postData = "";
  req.on("data", (chunk) => {
  postData = postData + chunk;
  });
  req.on("end", () => {
  postData = querystring.parse(postData);

  var filename = postData.filename;
  var course = postData.course;
  var teacher = postData.teacher;
  var downloadtime = 0;
  var filesize = postData.filesize;
  var uploadtime = getCurrDate();
  var fileformat = postData.fileformat;
  var magnetURL = postData.magnetURL;

  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '123456',
    database : 'qqshare'
  });

  connection.connect();

  var addSql = 'INSERT INTO qqshare_info (filename,course,teacher,downloadtime,filesize,uploadtime,fileformat,magnetURL) VALUES(?,?,?,?,?,?,?)';
  var addSqlParams = [filename,course,teacher,downloadtime,filesize,uploadtime,fileformat,magnetURL];

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
  console.log('post');
  var postData = "";
  req.on("data", (chunk) => {
  postData = postData + chunk;
  });
  req.on("end", () => {
  postData = querystring.parse(postData);
  //console.log(postData);
  console.log(postData['id'],postData['pwd']);
  db = [[2020210942,{pwd:123456,name:'zouyansong'}],
    [2020000000,{pwd:123456,name:'robot'}],
    [123,{pwd:123,name:'test'}]];
  var map = new Map(db);
  var resData = undefined;
  var v = map.get(Number(postData['id']));
  if(v){
    console.log("用户存在");
    if (v['pwd'] === Number(postData['pwd'])){
    console.log("密码正确");
    resData = [{flag:1,name:v['name']}];
    }
    else{
    console.log("密码错误");
    resData = [{flag:2}];
    }
  }
  else{
    console.log("用户不存在");
    resData = [{flag:3}];
  }
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(resData));
    });
  });

  console.log("-------------");
  
})


app.get('/api/test', function (req, res) {

  console.log(getCurrDate());
  res.send(getCurrDate());
  
})



var server = app.listen(port_number, function () {
 
  var host = server.address().address
  var port = server.address().port
 
  console.log("QQShare is running at http://%s:%s", host, port)
 
})


// https://blog.csdn.net/itmyhome1990/article/details/89372292
function getCurrDate() {
	var date = new Date();
	var sep = "-";
	var year = date.getFullYear(); //获取完整的年份(4位)
	var month = date.getMonth() + 1; //获取当前月份(0-11,0代表1月)
	var day = date.getDate(); //获取当前日
	if (month <= 9) {
		month = "0" + month;
	}
	if (day <= 9) {
		day = "0" + day;
	}
	var currentdate = year + sep + month + sep + day;
	return currentdate;
}
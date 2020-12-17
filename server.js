// 测试查询链接：
// http://localhost:8081/api/search?filename=%E7%BB%84%E5%90%88%E6%95%B0%E5%AD%A6&course=%E7%BB%84%E5%90%88%E6%95%B0%E5%AD%A6&teacher=%E9%A9%AC%E6%98%B1%E6%98%A5
// 测试插入链接：（自行）

// 命令行：node server.js --port=8023  可自定义端口
const args = require('minimist')(process.argv.slice(2));
var port_number= args['port'] ? args['port'] : 8081; // 端口号

var express = require('express');
var querystring = require('querystring');
var app = express();
 


app.post('/api/uservalid', function (req, res) {
  console.log("----------------------------------------");
  console.log('/api/uservalid');
  var postData = "";

  req.on("data", (chunk) => {
    postData = postData + chunk;
  });
  
  req.on("end", () => {
    postData = querystring.parse(postData);

    console.log("----------------------------------------");
    console.log('postData:', postData);

    var post_id = postData.id;
    var post_pwd = postData.pwd;

    var mysql      = require('mysql');
    var connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : '123456',
      database : 'qqshare'
    });

    connection.connect();

    var SQL_query = 'SELECT id,password,name FROM user_info WHERE id=\'' + post_id + '\';';

    connection.query(SQL_query,function (err, result) {
      if(err){
        console.log('[SELECT ERROR] - ',err.message);
        resData = {flag: 0};
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(resData));
        return;
      }
      console.log('----------------------SELECT------------------------');
      console.log("SQL_query:", SQL_query);
      console.log("result:", result);
      
      if(result.length){
        console.log("用户存在");
        if (result[0]['password'] == Number(postData['pwd'])){
          console.log("密码正确");
          resData = {flag:1,name:result[0]['name']};
        }
        else{
          console.log("密码错误");
          resData = {flag:2};
        }
        console.log("resData:", resData);
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(resData));
      }
      else{
        console.log("用户不存在");
        resData = {flag:3};
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(resData));
      }
    });
    connection.end();
  });
})

app.get('/api/hotfile', function (req, res){
  console.log("----------------------------------------");
  console.log('/api/hotfile');
  // 暂时设计为选择【所有时间中下载量最高的10个文件】
  // 如果需要获得近期的热门文件，可能需要维护一个定期更新的下载量数组，然后循环更新，暂时搁置
  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '123456',
    database : 'qqshare'
  });

  connection.connect();

  var SQL_query = 'SELECT filename,description FROM qqshare_info ORDER BY downloadtime DESC LIMIT 10;';

  connection.query(SQL_query, function (err, results, fields) {
    if(err){
      console.log('[SELECT ERROR] - ',err.message);
      resData = {flag: 0};
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(resData));
      return;
    }
    
    res.setHeader("Content-Type", "application/json");
    console.log("----------------------------------------");
    console.log(JSON.stringify(results));
    res.end(JSON.stringify(results));
  });

  connection.end();
})

app.get('/api/search', function (req, res) {
  console.log("----------------------------------------");
  console.log('/api/search');

  console.log("----------------------------------------");
  console.log("req.query: ", req.query);
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

  var filename_filter = req.query.filename ? req.query.filename : ".";
  var course_filter = req.query.course ? req.query.course : ".";
  var teacher_filter = req.query.teacher ? req.query.teacher : ".";

  // if it's all empty, then return an invalid search.
  if(filename_filter == "." && course_filter == "." && teacher_filter == "."){
    console.log('Invalid search.');
    resData = {flag: 0};
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(resData));
    return;
  }

  var SQL_query = 'SELECT * FROM qqshare_info WHERE filename REGEXP "'
              + filename_filter 
              + '" AND course REGEXP "' 
              + course_filter 
              + '" AND teacher REGEXP "'
              + teacher_filter
              + '";';

  connection.query(SQL_query, function (err, results, fields) {
    if(err){
      console.log('[SELECT ERROR] - ',err.message);
      resData = {flag: 0};
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(resData));
      return;
    }
    //console.log(results);
    //console.log('The solution is: ', results[0].filename);
    
    res.setHeader("Content-Type", "application/json");
    console.log("----------------------------------------");
    console.log(JSON.stringify(results));
    res.end(JSON.stringify(results));
  });

  connection.end();
})

app.post('/api/upload', function (req, res) {
  console.log("----------------------------------------");
  console.log('/api/upload');
  // magnetURI中有特殊字符，可能需要转义：
  // https://segmentfault.com/a/1190000009492789
  var postData = "";
  req.on("data", (chunk) => {
    postData = postData + chunk;
  });
  req.on("end", () => {
    postData = querystring.parse(postData);
    
    console.log("----------------------------------------");
    console.log('postData:',postData);

    // 在文件数据表中加入该文件
    var filename = postData.filename;
    var course = postData.course;
    var teacher = postData.teacher;
    var downloadtime = 0;
    var filesize = postData.filesize;
    var uploadtime = getCurrDate();
    var fileformat = postData.fileformat;
    var description = postData.description;
    var magnetURI = postData.magnetURI;
    
    console.log("---------------------");
    console.log("magnetURI.length", magnetURI.length);

    var mysql      = require('mysql');
    var connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : '123456',
      database : 'qqshare'
    });
    
    connection.connect();

    var addSql = 'INSERT INTO qqshare_info (filename,course,teacher,downloadtime,filesize,uploadtime,fileformat,description,magnetURI) VALUES(?,?,?,?,?,?,?,?,\''
            + magnetURI +'\')';
    var addSqlParams = [filename,course,teacher,downloadtime,filesize,uploadtime,fileformat,description];

    connection.query(addSql,addSqlParams,function (err, result) {
      if(err){
        console.log('[INSERT ERROR] - ',err.message);
        resData = {flag: 0};
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(resData));
        return;
      }

      console.log('--------------INSERT----------------');
      //console.log('INSERT ID:',result.insertId);        
      console.log('INSERT ID:',result);        
      
      // resData = {flag: 1};
      // res.setHeader("Content-Type", "application/json");
      // res.end(JSON.stringify(resData));
    });

    // connection.query("SELECT * FROM qqshare_info;",function (err, result) {
    //   if(err){
    //     console.log('[SELECT ERROR] - ',err.message);
    //     return;
    //   }
    // });




    // 在用户数据表中更新用户的历史上传记录
    // 为避免多次重传，这部分放在后，只有在成功插入文件数据库后才可能执行
    var id = postData.id;

    // UPDATE user_info SET uploadrecord=concat(uploadrecord,',magnet:?fake') WHERE id='123';
    var SQL_query = 'UPDATE user_info SET uploadrecord=concat(uploadrecord,\','
              + magnetURI
              + '\') WHERE id=\''
              + id
              + '\';';
    console.log('SQL:', SQL_query);
    

    connection.query(SQL_query,function (err, result) {
      if(err){
        console.log('[UPDATE ERROR] - ',err.message);
        resData = {flag: 0};
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(resData));
        return;
      }
      console.log('--------------------------UPDATE----------------------------');    
      console.log('SQL:', SQL_query);
      resData = {flag: 1};
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(resData));
    });
    
    connection.end();
    });
})

app.get('/api/uploadrecord', function (req, res){
  console.log("----------------------------------------");
  console.log('/api/uploadrecord');
  console.log("req.query: ", req.query);

  if(req.query.id == ''){   // 空查询处理
    resData = {flag: 0};
    console.log("查询为空，失败。");
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(resData));
    return;
  }
  
  var mysql      = require('mysql');
  var connection1 = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '123456',
    database : 'qqshare'
  });

  connection1.connect();
  
  var SQL_query1 = 'SELECT uploadrecord FROM user_info WHERE id=\''
              + req.query.id + '\';';
  console.log("SQL_query1:", SQL_query1);

  var uploadrecord = "";
  connection1.query(SQL_query1, function (err, results, fields) {
    if(err){
      console.log('[SELECT ERROR] - ',err.message);
      resData = {flag: 0};
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(resData));
      return;
    }
    console.log("results: ", results);
    
    uploadrecord = results[0].uploadrecord;
    console.log("uploadrecord: ", uploadrecord);
    console.log("----------------------------------------");
    if(uploadrecord == ""){
      // 当没有下载过文件时返回[]
      resData = [];
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(resData));
      return;
    }

    var connection2 = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : '123456',
      database : 'qqshare'
    });
    
    connection2.connect();


    var upload_magnet_list = uploadrecord.split(',').filter(function (el) { return el != ''; });    // 清洗
    console.log("upload_magnet_list: ", upload_magnet_list);

    upload_magnet_list = JSON.stringify(upload_magnet_list).replace('[','(').replace(']',')').replace(/\"/g,'\'');
    console.log("upload_magnet_list(after modify): ", upload_magnet_list);

    var SQL_query2 = 'SELECT filename,downloadtime,uploadtime FROM qqshare_info WHERE magnetURI IN '
                    + upload_magnet_list + ';';
    console.log("SQL_query2:", SQL_query2);

    connection2.query(SQL_query2, function (err, results, fields) { 
      if(err){
        // 如果记录为空，SELECT错误。
        console.log('[SELECT ERROR] - ',err.message);
        resData = {flag: 0};
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(resData));
        return;
    }

      res.setHeader("Content-Type", "application/json");
      console.log("----------------------------------------");
      console.log(JSON.stringify(results));
      res.end(JSON.stringify(results));
    })

    connection2.end();
    
  });

  connection1.end();
  
})

app.post('/api/download', function (req, res){
  console.log("----------------------------------------");
  console.log('/api/download');
  var postData = "";
  req.on("data", (chunk) => {
    postData = postData + chunk;
  });
  req.on("end", () => {
    postData = querystring.parse(postData);

    console.log("----------------------------------------");
    console.log('postData:', postData);

    // 在文件数据表给该文件的downloadtime加一
    var magnetURI = postData.magnetURI;
    console.log("magnetURI:", magnetURI);

    var mysql      = require('mysql');
    var connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : '123456',
      database : 'qqshare'
    });
    
    connection.connect();

    var SQL_query = 'UPDATE qqshare_info SET downloadtime=downloadtime+1 WHERE magnetURI=\''
                + magnetURI + '\';';
    console.log('SQL:', SQL_query);

    connection.query(SQL_query,function (err, result) {
      if(err){
        console.log('[UPDATE ERROR] - ',err.message);
        resData = {flag: 0};
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(resData));
        return;
      }
      console.log('----------------UPDATE1----------------');
      
      console.log('SQL:', SQL_query);
      // resData = {flag: 1};
      // res.setHeader("Content-Type", "application/json");
      // res.end(JSON.stringify(resData));
    });



    // 在用户数据表中把该文件的加入到用户的历史下载记录中
    var id = postData.id;
    console.log("id:", id);

    // UPDATE user_info SET downloadrecord=concat(downloadrecord,',magnet:?fake') WHERE id='123';
    var SQL_query = 'UPDATE user_info SET downloadrecord=concat(downloadrecord,\','
              + magnetURI
              + '\') WHERE id=\''
              + id
              + '\';';
    console.log('SQL:', SQL_query);

    connection.query(SQL_query,function (err, result) {
      if(err){
        console.log('[UPDATE ERROR] - ',err.message);
        resData = {flag: 0};
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(resData));
        return;
      }
      console.log('----------------UPDATE2----------------');
      console.log('SQL:', SQL_query);
      resData = {flag: 1};
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(resData));
    });
    

    connection.end();
  });
  
})

app.get('/api/downloadrecord', function (req, res){
  console.log("----------------------------------------");
  console.log('/api/downloadrecord');
  console.log("req.query: ", req.query);

  if(req.query.id == ''){   // 空查询处理
    resData = {flag: 0};
    console.log("查询为空，失败。");
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(resData));
    return;
  }
  
  var mysql      = require('mysql');
  var connection1 = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '123456',
    database : 'qqshare'
  });

  connection1.connect();
  
  var SQL_query1 = 'SELECT downloadrecord FROM user_info WHERE id=\''
              + req.query.id + '\';';
  console.log("SQL_query1:", SQL_query1);

  var downloadrecord = "";
  connection1.query(SQL_query1, function (err, results, fields) {
    if(err){
      console.log('[SELECT ERROR] - ',err.message);
      resData = {flag: 0};
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(resData));
      return;
    }
    console.log("results: ", results);
    
    downloadrecord = results[0].downloadrecord;
    console.log("downloadrecord: ", downloadrecord);
    console.log("----------------------------------------");
    if(downloadrecord == ""){
      // 当没有下载过文件时返回[]
      resData = [];
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(resData));
      return;
    }

    var connection2 = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : '123456',
      database : 'qqshare'
    });
    
    connection2.connect();


    var download_magnet_list = downloadrecord.split(',').filter(function (el) { return el != ''; });    // 清洗
    console.log("download_magnet_list: ", download_magnet_list);

    download_magnet_list = JSON.stringify(download_magnet_list).replace('[','(').replace(']',')').replace(/\"/g,'\'');
    console.log("download_magnet_list(after modify): ", download_magnet_list);

    var SQL_query2 = 'SELECT filename,downloadtime,uploadtime FROM qqshare_info WHERE magnetURI IN '
                    + download_magnet_list + ';';
    console.log("SQL_query2:", SQL_query2);

    connection2.query(SQL_query2, function (err, results, fields) { 
      if(err){
        console.log('[SELECT ERROR] - ',err.message);
        resData = {flag: 0};
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(resData));
        return;
    }

      res.setHeader("Content-Type", "application/json");
      console.log("----------------------------------------");
      console.log(JSON.stringify(results));
      res.end(JSON.stringify(results));
    })

    connection2.end();
    
  });

  connection1.end();
  
})

app.post('/api/changename', function (req, res){
  console.log("----------------------------------------");
  console.log('/api/changename');
  var postData = "";
  req.on("data", (chunk) => {
    postData = postData + chunk;
  });
  req.on("end", () => {
    postData = querystring.parse(postData);

    var id = postData.id;
    var newname = postData.newname;

    var mysql      = require('mysql');
    var connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : '123456',
      database : 'qqshare'
    });

    connection.connect();

    var SQL_query = 'UPDATE user_info SET name=\''+newname+'\' WHERE id=\''+id+'\';';

    connection.query(SQL_query,function (err, result) {
      if(err){
        console.log('[UPDATE ERROR] - ',err.message);
        resData = {flag: 0};
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(resData));
        return;
      }
      console.log('--------------------------UPDATE----------------------------');
      console.log("SQL_query:", SQL_query);
      console.log("newname:", postData.newname);
      
      resData = {flag: 1};
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(resData));
    });
    

    connection.end();
  });
})

app.get('/api/test_getCurrDate', function (req, res) {
  console.log("----------------------------------------");
  console.log('/api/test_getCurrDate');
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
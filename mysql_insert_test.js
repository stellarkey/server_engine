var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '123456',
  database : 'qqshare'
});

connection.connect();

var addSql = 'INSERT INTO qqshare_info (filename,course,teacher,filesize,uploadtime,fileformat,magnetURL) VALUES(?,?,?,?,?,?,?)';
var addSqlParams = ['测试样例','测试','某老师',11*1024*1024,'2020-11-26','.pdf','magnet:?xt=urn:btih:c12fe1c06bba15559dc9f519b345aa7c13612823'];

connection.query(addSql,addSqlParams,function (err, result) {
  if(err){
   console.log('[INSERT ERROR] - ',err.message);
   return;
  }        

 console.log('--------------------------INSERT----------------------------');
 //console.log('INSERT ID:',result.insertId);        
 console.log('INSERT ID:',result);        
 console.log('-----------------------------------------------------------------\n\n');  
});

connection.query("SELECT * FROM qqshare_info;",function (err, result) {
  if(err){
    console.log('[SELECT ERROR] - ',err.message);
    return;
  }

 console.log('--------------------------SELECT----------------------------');
 console.log(result);
 console.log('------------------------------------------------------------\n\n');  
});

connection.end();
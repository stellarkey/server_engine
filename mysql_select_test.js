var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '123456',
  database : 'qqshare'
});
 
connection.connect();

var file_name_filter = "组合数学";
var course_filter = "组合数学";
var teacher_filter = "马昱春";
// if it's empty, then use: " " (with a space)

var SQL_query = 'SELECT * FROM qqshare_info WHERE filename REGEXP "'
            + file_name_filter 
            + '" OR course REGEXP "' 
            + course_filter 
            + '" OR teacher REGEXP "'
            + teacher_filter
            + '";';

connection.query(SQL_query, function (error, results, fields) {
  if (error) throw error;
  console.log(results);
  //console.log('The solution is: ', results[0].filename);
});

connection.end();
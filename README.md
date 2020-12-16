# server_engine
 server_engine for [`qqshare`](https://github.com/zouyansong/qingqingshare).

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

…And other interfaces.

# 清清共享API接口设计

> From zys: [https://github.com/zouyansong/qingqingshare/blob/main/qqshare/other/%E6%B8%85%E6%B8%85%E5%85%B1%E4%BA%ABAPI%E6%8E%A5%E5%8F%A3%E8%AE%BE%E8%AE%A1.md](https://github.com/zouyansong/qingqingshare/blob/main/qqshare/other/%E6%B8%85%E6%B8%85%E5%85%B1%E4%BA%ABAPI%E6%8E%A5%E5%8F%A3%E8%AE%BE%E8%AE%A1.md)
>

### 1.用户登录界面

描述：根据请求里的用户id去数据库里查找对应用户

请求地址：/api/uservalid

参数：{id: *, pwd: *}

方法：POST

返回结果：密码正确返回{flag: 1，name:**}

密码错误返回{flag: 2}  用户不存在返回{flag: 3}

**注意** <u>需要把之前我写的那部分里的中括号[]去除</u> 



### 2.用户搜索界面首页

描述：获得近期的热门文件(一周内下载量/搜索量最高的10个文件，此功能在数据库端实现麻烦，先不实现，可以返回写死的<u>**静态数据**</u>，<u>并且这10个文件加上description，是数据库中确实存在的文件</u>，当然数据库中没有description也无所谓，但是你伪造的静态数据要有描述，可参照我最新的server.js文件，从搜索界面首页可以点击该文件直接进入搜索界面）

请求地址：/api/hotfile

参数：无

方法：GET

返回结果：只需要返回这10个文件的名字和描述，不需要文件大小等信息，格式：[{filename:*, description: *}, ……]



### 3.用户搜索结果界面

描述：获得所有匹配的搜索结果

请求地址：/api/search?filename=* &course=* &teacher=*

参数：在url中

方法：GET

返回结果：数据库中存储的有关该文件的所有信息都要返回，即返回[{filename: *, description: *, course: *, teacher: *, downloadtime: *, filesize: *, uploadtime: *, fileformat: *, magnetURI}]，当没有匹配结果返回[]

**注意** 此处是URI不是URL(我也不知道为什么是URI，只是为了和组长写的磁力链接下载部分对应上)



### 4.用户上传文件种子

描述：用户上传文件种子，不仅要在文件数据表中加入该文件，而且需要在用户数据表中更新用户的历史上传记录

请求：/api/upload

参数：{id: , filename: , course: , teacher: , fileformat: , filesize: , description: , magnetURI: },其中id为用户id，服务器端补充上传时间参数uploadtime，下载次数downloadtime初始化为0

方法：POST

返回结果：{flag: 1/0} 1表示成功，0表示失败



### 5.用户上传历史记录查询

描述：根据用户id返回用户上传过的所有文件

请求： /api/uploadrecord?id=**

参数：在url中

方法： GET

返回结果：返回文件名、下载次数和上传时间

[{filename:*, downloadtime: *, uploadtime: *}, ……]

当没有上传过文件时返回[]



### 6.用户下载文件

描述：当用户下载文件时，不仅要在文件数据表给该文件的downloadtime加一，而且需要在用户数据表中把该文件的加入到用户的历史下载记录中

请求： /api/download

参数： {id: , magnetURI: }

方法：POST

返回结果：数据库修改成功返回{flag: 1}，否则返回{flag: 0}



### 7.用户下载记录查询

描述：根据用户id返回用户下载过的所有文件

请求： /api/downloadrecord?id=**

参数：在url中

方法： GET

返回结果：返回文件名、下载次数和上传时间

[{filename:*, downloadtime: *, uploadtime: *}, ……]

当没有下载过文件时返回[]



### 8.用户昵称修改

描述：其实设置里本应该要有不少个人信息的维护，我们这里就只维护下用户的昵称信息吧

请求：/api/changename

参数:  {id: , newname: }

方法：POST

返回结果：{flag:1/0}，成功返回1，失败返回0
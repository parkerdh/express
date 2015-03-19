var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var http = require('http');
var fs = require('fs');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var basicAuth = require('basic-auth-connect'); 
var url = require('url');
var auth = basicAuth(function(user, pass) { 
	return((user ==='cs360')&&(pass === 'test'));
 });
app.use(bodyParser.json());
var options = {
    host: '127.0.0.1',
    key: fs.readFileSync('ssl/server.key'),
    cert: fs.readFileSync('ssl/server.crt')
  };
http.createServer(app).listen(80);
https.createServer(options, app).listen(443);
app.get('/', function(req, res){
  res.send('Hello from Express');
});

app.use('/', express.static('./html', {maxAge: 60*60*1000}));
app.get('/getcity', function (req, res) { 
	var urlObj = url.parse(req.url, true, false);
	console.log("In getcity route"); 
 	fs.readFile('cities.dat.txt', function (err, data) {
                if(err) throw err;
                var myRe = new RegExp("^"+urlObj.query["q"]);
                console.log(myRe);
		var jsonresult = [];
                cities = data.toString().split("\n");
		for(var i = 0; i < cities.length; i++) {
                         var result = cities[i].search(myRe);
                         if(result != -1) {
                                console.log(cities[i]);
                                jsonresult.push({city:cities[i]});
                         }
                }
                console.log(jsonresult);

                console.log(JSON.stringify(jsonresult));
                res.writeHead(200);
                res.end(JSON.stringify(jsonresult));
});



});
 app.get('/comment', function (req, res) { 
	console.log("In comment route"); 
	MongoClient.connect("mongodb://localhost/weather", function(err, db) {
        if(err) throw err;
        db.collection("comments", function(err, comments){
                if(err) throw err;
                comments.find(function(err, items){
                items.toArray(function(err, itemArr){
                console.log("Document Array: ");
                console.log(itemArr);
                res.writeHead(200);
                res.end(JSON.stringify(itemArr));
            });
          });
        });
      });
}); 
 app.post('/comment',auth, function (req, res) { 


	console.log("In POST comment route"); 
	console.log(req.user);
	console.log("Remote User");
	console.log(req.remoteUser);	
	console.log(req.body); 
	MongoClient.connect("mongodb://localhost/weather", function(err, db) {
          if(err) throw err;
          db.collection('comments').insert(req.body,function(err, records) {
            console.log("Record added as "+records[0]._id);
          });
        });


	res.writeHead(200);
        res.end("");

}); 


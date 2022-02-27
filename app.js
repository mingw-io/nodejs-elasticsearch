var express = require('express');
var http = require('http');
var https = require('https');
var fs = require('fs');

const routes = require('./routes');

routes.client.ping((error) => {
    if (error) {
      console.error('Cannot connect to Elasticsearch!');

	  routes.client.close();

	  // return;
	  process.exit(5);
    } 
	console.log('--> Connection to Elasticsearch was successful! <--');
});

routes.client.cluster.health({}, function(err,resp,status) {
    if (err) {
        console.log(err);
        return;
	}

  console.log("--> Elasticsearch Health <--",resp);
});


var port = process.env.PORT || 3001;

var sslOptions = {
key: fs.readFileSync('certs/server.key','utf8'),
cert: fs.readFileSync('certs/server.pem','utf8'),
ca: [
fs.readFileSync('certs/rootca.pem','utf8')
]
};

const app = express();

app.use('/api/v1', routes.router);

var insecureServer = http.createServer();

insecureServer.on('request', app);

insecureServer.listen(80, function () {
  console.log("Listening on " + insecureServer.address().address + ":" + insecureServer.address().port);
});

var secureServer = https.createServer(sslOptions);

secureServer.on('request', app);

secureServer.listen(port, function () {
  console.log("Listening (SSL) on " + secureServer.address().address + ":" + secureServer.address().port);
});
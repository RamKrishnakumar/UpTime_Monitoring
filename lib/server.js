/**
 * Server-related tasks
 */


//Dependencies
 var http = require('http');
 var https = require('https');
 var url = require('url');
 var StringDecoder = require('string_decoder').StringDecoder;
 var config = require('./config');
 var fs = require('fs'); // fs is file system module
 var _data = require('./data');
 var handlers = require('./handlers');
 const helpers = require('./helpers');
 const sendSms = require('./twilio');
 const path = require('path');

 //instantiate the server module object 
 var server = {};
 
 //Instantiate the HTTP server
 server.httpServer = http.createServer((req,res)=>{
    server.unifiedServer(req,res);
 });
 

 
 //Instantiate the HTTPS server
 server.httpsServerOptions ={
     'key': fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
     'cert': fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
 }
 server.httpsServer = https.createServer(server.httpsServerOptions,(req,res)=>{
     server.unifiedServer(req,res);
 })
 

 
 
 //All the server logic for both the http and https server
 //unified Server
 
 server.unifiedServer = function(req,res) {
     //Get the Url and pass it
     var parsedUrl = url.parse(req.url,true);
 
     //Get the path
     var path = parsedUrl.pathname;
     var trimmedPath = path.replace(/^\/+|\/+$/g,'');
 
     //Get the query string as an object
     var queryStringObject = parsedUrl.query;
 
     //Get the Http Method
     var method = req.method.toLowerCase();
 
     //Get the header as an Object
     var headers = req.headers;
 
     var buffer = '';
 
     //if there is any data or payload we will store it into buffer
     req.on('data', data =>{
         buffer += data;
     });
 
     req.on('end',()=>{
         
         //Choose the handler this request should go to.
         //If specified handler didn't find the use notfound handler
         var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;
 
         //Construct the data object
         //Send the response
 
     var responseData = {
         trimmedPath: trimmedPath,
         queryStringObject : queryStringObject,
         method: method,
         headers: headers,
         payload: buffer !== ''? helpers.parseJsonToObject(buffer) : buffer
     };
     chosenHandler( responseData , (statusCode, payload)=>{
         // use the status code called back by handler or use the defalut to 200
         statusCode = typeof(statusCode) == 'number'? statusCode : 200;
         //use the payload called back or use the default to an empty object
         payload = typeof(payload) == 'object' ? payload : {};
 
         //stringify the payLoad
         var payloadString = JSON.stringify(payload);
 
         //return response
 
         res.setHeader('Content-Type','application/json'); // this header specifies the type of data (json, text, etc)
         res.writeHead(statusCode);
         res.end(payloadString);
         console.log('Return this response:',statusCode );
     });
     });
 }
 
 
 //Define a request router
 
 server.router ={
     'ping': handlers.ping,
     'login': handlers.login,
     'users': handlers.users,
     'tokens':handlers.tokens,
     'checks':handlers.checks
 }

 //Init script
 server.init = function(){
    //Start the Http Server
        server.httpServer.listen(config.httpPort, ()=>{
        console.log("The Server is listening on port "+config.httpPort+" in " +config.envName+" mode");
        });

     //Start the HTTPS server
        server.httpsServer.listen(config.httpsPort,()=>{
        console.log("The Server is listening on port "+config.httpsPort+" in " +config.envName+" mode");
        })
 }

 //Export the module
 module.exports = server;
 
 
 
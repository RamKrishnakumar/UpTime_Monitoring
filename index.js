/**
 * Primary File for the API
 * index.js that works dynamically
 */

var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./lib/config');
var fs = require('fs'); // fs is file system module
var _data = require('./lib/data');
var handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');


//Testing
// @TODO  delete this 

// _data.create('test','newFile',{'name':'ramKrishna'}, (err)=>{
//     console.log('this was the error ', err);
// })

// _data.read('test','newFile',(err,data)=>{
//     console.log('this was the error',err, 'and this was the data',data);
// });

// _data.update('test','newFile',{'name':'ramkrishna'},(err)=>{
//     console.log('this was the error ', err);
// });

//delete 
// _data.delete('test','newFile',(err)=>{
//     console.log('this was the error',err);
// });

//Instantiate the HTTP server
var httpServer = http.createServer((req,res)=>{
   unifiedServer(req,res);
});

//Start the Http Server
httpServer.listen(config.httpPort, ()=>{
  console.log("The Server is listening on port "+config.httpPort+" in " +config.envName+" mode");
});

//Instantiate the HTTPS server
var httpsServerOptions ={
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
}
var httpsServer = https.createServer(httpsServerOptions,(req,res)=>{
    unifiedServer(req,res);
})

//Start the HTTPS server
httpsServer.listen(config.httpsPort,()=>{
    console.log("The Server is listening on port "+config.httpsPort+" in " +config.envName+" mode");
})


//All the server logic for both the http and https server
//unified Server

var unifiedServer = function(req,res) {
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
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

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

// We need to create handlers for routing to the correct path that user want to visit
//therefore we created handlers.js



// //Define handlers
// var handlers ={};

// //PIng handler
// handlers.ping = function(data,callback){
//     callback(200,data);
// }

// handlers.login = function(data,callback){
//     callback(201,data)
// }

// // Not found handler (error 404)
// handlers.notFound = function(data,callback){
//     callback(404);
// }

//Define a request router

var router ={
    'ping': handlers.ping,
    'login': handlers.login,
    'users': handlers.users
}



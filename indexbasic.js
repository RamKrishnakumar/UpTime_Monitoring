/**
 * Primary File of the API
 * Basic to know about backend API's
 * This is index.js but static type convert this indexbasic.js to index.js and rename the present index.js file to something else
 */

// Dependencies
var http = require('http');  // library of http 
var url = require('url'); // library for path urls
var StringDecoder = require('string_decoder').StringDecoder;  //library to decode payload string
var config = require('./lib/config.js');

// The server should respond to all requests with a string
var server = http.createServer(function(req,res){           //creating server object
    
    // Get the url and parse it
    var parsedUrl = url.parse(req.url, true);

    // to get the path Get the path from that url
    var path = parsedUrl.pathname;  // untrimmed path
    var trimmedPath = path.replace(/^\/+|\/+$/g,''); //trimmed path

    //Get the query String as an Object
    var queryStringObject = parsedUrl.query;

    //To Get the Http Method
    var method = req.method.toLowerCase();

    //Get the headers as an object
    var headers = req.headers;

    //Get the payload, if any (payload is data normally send by a PoST or PUt Request.)
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    
    //if there is any data or payload we will store it to buffer string
    req.on('data', data => {
        buffer += data;        
    });
    
    //if payload or data ends then we need to stop stroing string into buffer and send response 
    req.on('end',function(){
        //buffer += decoder.end();

        //Choose the handler this request should go to . If one is not found, use notfound handler
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        //Construct the data object
        // Send the response
    var responseData = {
        trimmedPath: trimmedPath,
        queryStringObject: queryStringObject,
        method: method,
        headers: headers,
        payload: JSON.parse(buffer)
    };

    //route the request to the handler specified in the handler
    chosenHandler(responseData,function(statusCode,payload){
            //use the status code called back by handler or use the defult to 200
             statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            //use the payload called back by handler or use the defalut to an  empty object
             payload = typeof(payload) == 'object' ? payload : {};

             //convert the payload into a string
             var payloadString = JSON.stringify(payload);

             //return response
             res.setHeader('Content-Type','applicaiton/json'); //setting this hearder so that user can understanc what type of data we are getting
             res.writeHead(statusCode);
             res.end(payloadString);
             console.log('Returning this response: ', statusCode, payloadString);
    });

    // res.end(JSON.stringify(responseData));

    // // Log the request path
    // console.log(buffer);
    });


    
    
 
});

//Start the server
server.listen(config.port,function(){
    console.log(`The server is listenining to ${config.envName} mode on ${config.port} now`);
});
////////////////////////////////////////////////////////////////////



// We need to create handlers for routing to the correct path that user want to visit
/**
 * Suppose user called path:3000/foo then foo handler should be called
 * If there is foo handler then we have to route to the foo handler and if we don't find foo handler then we have to set
 * default error 404 handler for not found.
 */


//Define handlers
var handlers ={};

//Sample Handlers
handlers.sample = function(data,callback){
    //callback a http status code, and a payload that should be an object
    callback(201,data);
};

// Not found handler (error 404)
handlers.notFound = function(data,callback){
    callback(404);
}

//Define a request router
var router ={
    'sample': handlers.sample
}
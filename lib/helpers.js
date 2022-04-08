/**
 * Helpers for various tasks
 * 
 */

//Dependencies
var cyrpto = require('crypto');
var config = require('./config');

//Container of all the helpers

var helpers = {}

// Create a SHA256 hash
helpers.hash = function(str){
    if(typeof(str) == 'string' && str.length > 0){
       var hash = cyrpto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
       return hash;
    }
    else{
        return false;
    }
}

//parse string and return as JSON Object
helpers.parseJsonToObject = function(str){
    try{
        var obj = JSON.parse(str);
        return obj;
    }
    catch(e){
        return {};
    };
}




//Export the module
module.exports = helpers
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

//Create a string of Random Aphonumeric Charcterss, of a given length
helpers.createRandomString = function(strLength){
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
    if(strLength){
       // Define all the possible characters that could go into string
       var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

       //Start the final string
       var str = '';
       
       for(i = 1;i <= strLength;i++){
           //Get random charcters from possibleCharacters strin
           var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random()* possibleCharacters.length));
           //Append this chacter to the final string
           str+=randomCharacter;
       }
       
       //Return the final string
       return str;
    }
    else{
        return false;
    }
}




//Export the module
module.exports = helpers
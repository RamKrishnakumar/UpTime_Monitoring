/**
 * Request Handlers
 */

//Dependencies
var _data = require('./data');
var helpers = require('./helpers') //custom library to encrypt the password

//Define the handlers
var handlers = {}

//Users handlers
//this function will figure out that which method you are requesting
handlers.users = function(data,callback){
    var acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method) > -1 ){
        handlers._users[data.method](data,callback);
    }
    else{
        callback(405,{'ErrorCode':405,'message':'Method Not Allowed'});
    }
};

//Container for the users submethods
handlers._users = {};

//Users - post
//Required data: firstname, lastname, phone, password, tosAgreement
//optional data: none
handlers._users.post = function(data,callback){
//Check that all required field are filled out
var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim(): false;
var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

if(firstName && lastName && phone && password && tosAgreement){
   // Make sure that the user doesn't allready exist
   _data.read('users',phone,function(err,data){
       if(err){
           //Hash the Password or Encrypt the password
           var hashedPassword = helpers.hash(password);
           if(hashedPassword){
               //Create the user object
                var userObject = {
                    'firstName':firstName,
                    'lastName': lastName,
                    'phone': phone,
                    'hashedPassword': hashedPassword,
                    'tosAgreement': true
                }
                //Store the user to users directory
                _data.create('users',phone,userObject,function(err){
                    if(!err){
                    callback(200,{'statusCode': 1,'status':'successful','message':'User created successfully'})
                    }
                    else{
                    callback(500,{'Error':500,'message':'Unable to create New User','err':err});
                    }
                });
           }
           else{
               callback(500,{'Error':500,'message':'Could not hash the user\'s password'});
           }
       }
       else{
           //User already exists
           callback(400, {'Error':400,'message': 'A user with that phone no. already exists'});
       }
   })
}
else{
    callback(400,{'Error':400,'message': ' Bad Request Missing Required Fields'});
}
};

//Users - get
//Required Data: phone
//optional data: none
//@TODO Only let an authenticated user access their objects. Don't let them access other's data

handlers._users.get = function(data,callback){
// Check that the phone no. is valid
var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
if(phone){
_data.read('users',phone,(err,data)=>{
    if(!err && data){
      // Remove the hashpassword
      delete data.hashedPassword;
      callback(200,{'status':'success','data':data});
    }
    else{
       callback(404,{'Error':404,'message':'User Details not Found'})
    }
})
}
else{
    callback(400,{'Error':'400 Bad Request','message':'Missing Required field'});
}

};

//Users - put
//Required data: phone
//Optional Data: firstname, lastname, password(at least on must be specified)
// @TODO Only let an authenticated user access their objects. Don't let them access other's data
handlers._users.put = function(data,callback){
    //Read the data
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    //Check for the optional fields
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim(): false;

    // Error if the phone is invalid
    if(phone){
       //Error if nothing is sent to update
       if(firstName || lastName || password){
            //Lookup the user
            _data.read('users',phone,(err,userData)=>{
               if(!err && userData){
                  if(firstName){
                      userData.firstName = firstName;
                  }
                  if(lastName){
                      userData.lastName = lastName;
                  }
                  if(password){
                      userData.hashedPassword = helpers.hash(password);
                  }
                  // Store the updated data back to users dir
                  _data.update('users',phone,userData,(err,data)=>{
                      if(!err){
                          callback(200,{'statusCode':200,'message':'Data updated Successfully'});
                      }
                      else{
                          callback(500,{'Error':500,'message':'Could not update the User'})
                      }
                  })
               }
               else{
                   callback(400,{'Error':'400','message':'The specified user not exist'});
               }
            })
       }
       else{
           callback(400,{'Error':400,'message':'Missing required field'});
       }
    }
    else{
        callback(400,{'Error':400,'message':'Missing required field'});

    }


};

//Users - delete
//require field: phone
// @TODO -  @TODO Only let an authenticated user access their objects. Don't let them access other's data
// @TODO - Cleanup (Delete) any other data files associated with this user
handlers._users.delete = function(data,callback){
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if(phone){
        _data.read('users',phone,(err,data)=>{
            if(!err && data){
               _data.delete('users',phone,(err)=>{
                  if(!err){
                     callback(200,{'statusCode':200,'message':'User Deleted Successfully'});
                  }
                  else{
                      callback(500,{"Error":500,"message":"could not delete the specified user"});
                  }
               })
            }
            else{
                callback(404,{'Error':404,'message':'The Specified User did not exist'});
            }
        })
    }
    else{
        callback(400,{'Error':400,'message':'Missing required field'});
    }

};

//PIng handler
handlers.ping = function(data,callback){
    callback(200,data);
}

//login handler
handlers.login = function(data,callback){
    callback(201,data)
}

/**
 * Suppose user called path:3000/foo then foo handler should be called
 * If there is foo handler then we have to route to the foo handler and if we don't find foo handler then we have to set
 * default error 404 handler for not found.
 */

// Not found handler (error 404)
handlers.notFound = function(data,callback){
    callback(404,{'Error':404,'message':`No HTTP resource was found that matches the request '${data.trimmedPath}'`});
}

module.exports = handlers;
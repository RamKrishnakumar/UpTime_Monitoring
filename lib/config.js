/**
 * Create and export confriguration variables
 */

//Container for all the environments
var environments = {};

//staging (defalut) environment
environments.staging ={
   'httpPort': 3000,
   'httpsPort': 3001,
   'envName': 'staging',
   'hashingSecret':'thisIsASecret',
   'maxChecks': 5,
   'twilio':{
      'accountSid':'ACd47b42bc78b719a03705525385f03e04',
      'authToken':'64bcdc1ccec9ab9be69c6d11ff1592f9',
      'fromPhone':'+19379156143'
      // 'accountSid':'ACb32d411ad7fe886aac54c665d25e5c5d',
      // 'authToken':'9455e3eb3109edc12e3d8c92768f7a67',
      // 'fromPhone':'+15005550006'
   }
};

//Production environment
environments.production ={
   'httpPort': 5000,
   'httpsPort':5001,
   'envName': 'production',
   'hashingSecret':'thisIsAlsoASecret',
   'maxChecks':5,
   'twilio':{
      'accountSid':'ACd47b42bc78b719a03705525385f03e04',
      'authToken':'64bcdc1ccec9ab9be69c6d11ff1592f9',
      'fromPhone':'+19379156143'
   }
};

// Determine which enviroment was passed as command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check wheater currentEnviroment variable is present in environments or not if not then default to staging.
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment]: environments.staging;

//Export the module

module.exports = environmentToExport;
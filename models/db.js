let mongoose = require('mongoose');
// mongoose.set('debug', true);

const { database, secret } = require('../config');
mongoose.Promise = global.Promise;

// Logger = require('mongodb').Logger;
// Logger.setLevel('debug');

mongoose.connect(database,{ });

var db = mongoose.connection;
// console.log("db", db)

db.on('connected', function () {
    console.log("Mongoose default connection is open to ", database);
});

// db.on('error',(error)=>{
//     console.log(error)
//     throw new Error(error);
// });

 db.on('error', console.error.bind(console, 'connection error:'));

module.exports = mongoose;
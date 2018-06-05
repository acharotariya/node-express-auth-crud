var express = require('express');
var app = express();
var bodyParser = require('body-parser')
const { hashSync, compareSync } = require('bcrypt');
const Users = require('../models/users');
const Items = require('../models/items');
const db = require('../models/db');
const { secret } = require('../config');
const { sign, verify } = require('jsonwebtoken');
var path = require('path');
var router = express.Router();
var cookieParser = require('cookie-parser');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});


// parse application/json
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
router.use(cookieParser());

// router.use(express.static(__dirname + '/public'));
// router.set('views', path.join(__dirname, 'views'));
// router.set('view engine', 'ejs');
// let str= "";


// app.get('/', function (req, res) {
//     // res.send("Hello world!");
//     res.sendFile('index.html');
// });


let getUsername = function (username) {
    promise = new Promise(function (resolve, reject) {
        Users.find({ username: username }).exec().then((users, err) => {
            if (users.length) {
                reject('That username already exist');
            } else {
                resolve('not exist')
            }
        })
    })

    return promise;
}

router.post('/signup', function (req, res) {
    console.log("signup called")
    getUsername(req.body.username).then((result) => {
        let user = new Users({ username: req.body.username, password: hashSync(req.body.password, 2) });
        user.save().then((user) => {
            console.log("user", user)
            res.send(JSON.stringify({ status: 1, code: 200, message: 'you are successfully register...' }));
        })
    }).catch((err) => {
        console.log("err >>>>>>>>>>>>>>", err)
        res.status(409);
        res.send(err);
    })
})


let attempt = function (username, password) {
    promise = new Promise(function (resolve, reject) {
        Users.find({ username: username }).exec().then((users) => {
            console.log("users", users)
            if (!users.length) {
                // res.status(401);
                reject("That user does not exist");
                // throw createError(401, 'That user does not exist');
            } else {
                const user = users[0];
                if (!compareSync(password, user.password)) {
                    // res.status(401);
                    reject("password doesn't match");
                    // throw createError(401, "password doesn't match");
                } else {
                    resolve(user);
                }
            }
        })
    })
    return promise;
};

router.post('/login', function (req, res) {
    // console.log("req.body.username",req.body.username)

    attempt(req.body.username, req.body.password).then((data) => {
        console.log("data", data)

        payload = {
            "userId": data._id,
            "iat": Math.floor(Date.now() / 1000) - 30,
            "exp": Math.floor(Date.now() / 1000) + (60 * 60),
            "aud": "https://yourdomain.com",
            "iss": "feathers",
            "sub": "anonymous"
        }
        console.log("payload", payload)
        let token = sign(payload, secret)
            console.log("token", token)
            res.cookie("auth_token", token, { "path": "/view" });
            res.redirect('/view');
        // res.render('view',{})
        // res.send(JSON.stringify({ status: 1, code: 200, message: 'you are successfully login...' ,logintoken:token}));

    }).catch((err) => {
        console.log("err >>>>>", err)
        res.redirect('/');
        // res.status(401);
        // res.send(err);
    })
})

router.post('/AddItem', function (req, res) {
    console.log("req", req.body.fruit)
    let item = new Items({ fruit: req.body.fruit, price: req.body.price });
    item.save().then((itemdata) => {
        console.log("itemdata", itemdata)
        res.redirect('/view')
    })
})

router.get('/EditItem/(:id)', function (req, res) {
    console.log("req", req.params.id)

    Items.find({ _id: req.params.id }).then((items) => {
        let data = items[0];
        if (items.length == 0) {
            res.status(401);
            res.send("item not exist");
        } else {
            res.render('edit', {
                id: data._id,
                fruit: data.fruit,
                price: data.price
            })
        }
    })
})

router.post('/UpdateItem/(:id)', function (req, res) {
    console.log("UpdateItem", req.body)
    query = { _id: req.params.id }
    const update = {
        $set: { "fruit": req.body.fruit, "price": req.body.price, "updated_at": new Date() }
    };
    Items.findOneAndUpdate(query, update, { returnNewDocument: true, new: true }).then((up) => {
        res.redirect('/view')
    })
})

router.get('/DeleteItem/(:id)', function (req, res) {
    console.log("req", req.params.id)
    Items.find({ _id: req.params.id }).then((items) => {
        let data = items[0];
        if (items.length == 0) {
            res.status(401);
            res.send("item not exist");
        } else {
            query = { _id: req.params.id }
            Items.findOneAndRemove(query).then((data) => {
                console.log("data", data)
                res.redirect('/view');
            })
        }
    })
})

var obj = {};

router.get('/view', function (req, res) {
    console.log("view called")
    Items.find({}, function (err, data) {
        console.log("data", data)
        obj = { dashboard: data };
        console.log("obj", obj)
        res.render('viewss', obj);
        // res.render('dashboard', { data: data });
    });
});
router.get('/logout', function (req, res) {
    console.log(req.cookies.auth_token)
    // res.clearCookie(req.cookies.auth_token);
    res.clearCookie(req.cookies.auth_token, { "path": "/view" });
    // res.send('cookie auth_token cleared');
    res.redirect("/")
})

module.exports = router;

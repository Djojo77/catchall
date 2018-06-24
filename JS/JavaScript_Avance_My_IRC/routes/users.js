const express   = require('express');
const router    = express.Router();
const session = require('express-session');
const mongoose  = require('mongoose');
const User      = mongoose.model('Users');
const Channel = mongoose.model('Channels');
let crypto    = require('crypto'), hmac, signature;
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize }   = require('express-validator/filter');

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('users/', { title: 'Users Manager Page', session: req.session.logged});
});

router.get('/login', (req, res, next) => {
    if (!req.session.logged) res.render('users/login', { title: 'Users Login Page', session: req.session.logged, test: 'tstndjksdjkc' });
    else res.redirect('/');
});

router.get('/register', (req, res, next) => {
    if (!req.session.logged) res.render('users/register', { title: 'Users Register Page', session: req.session.logged});
    else res.redirect('/');
});

router.get('/edit', (req, res, next) => {
    if (req.session.logged) {
        User.findOne({_id: req.session.user_id})
            .exec((err, doc) => {
                if (err) console.log('ERROR : ', err);;
                if (doc) {
                    console.log('DOC : ', doc);
                    res.render('users/edit', {title: 'User Edit Page', session: req.session.logged, user: doc})
                }
            });
    } else {
        res.redirect('/');
    }
});

router.post('/edit', (req, res, next) => {

    if (req.session.logged) {
        console.log('reqBody', req.body);

        let original = {
            _id: req.session._id,
            full_name: req.session.full_name,
            email: req.session.email,
        };

        let document = {
            full_name:   req.body.full_name,
            email:       req.body.email,
            // password:    encpassword,
            // dob:         req.body.dob,
            // country:     req.body.country,
            // gender:      req.body.gender,
        };

        User.findOne({ _id: original._id })
            .exec((err, doc) => {
                if (err) throw err;
                if (doc) console.log('DOC', doc);
                res.redirect('edit');
            });

        // hmac = crypto.createHmac("sha1", 'auth secret');
        // let encpassword = '';
        // if(req.body.password){
        //     hmac.update(req.body.password);
        //     encpassword = hmac.digest("hex");
        // }
    }
});

/* POST user registration page. */
router.post('/register',[

    check('full_name','Name cannot be left blank')
        .isLength({ min: 1 }),

    check('email')
        .isEmail().withMessage('Please enter a valid email address')
        .trim()
        .normalizeEmail()
        .custom(value => {
            return findUserByEmail(value).then(User => {
                //if user email already exists throw an error
            })
        }),

    check('password')
        .isLength({ min: 5 }).withMessage('Password must be at least 5 chars long')
        .matches(/\d/).withMessage('Password must contain one number')
        .custom((value,{req, loc, path}) => {
            if (value !== req.body.cpassword) {
                // throw error if passwords do not match
                throw new Error("Passwords don't match");
            } else {
                return value;
            }
        }),

    check('gender','Please select gender')
        .isLength({ min: 1 }),

    check('dob','Date of birth cannot be left blank')
        .isLength({ min: 1 }),

    check('country','Country cannot be left blank')
        .isLength({ min: 1 }),

], function(req, res, next) {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        res.json({status : "error", message : errors.array()});

    } else {

        hmac = crypto.createHmac("sha1", 'auth secret');
        let encpassword = '';

        if(req.body.password){
            hmac.update(req.body.password);
            encpassword = hmac.digest("hex");
        }
        let document = {
            full_name:   req.body.full_name,
            email:       req.body.email,
            password:    encpassword,
            dob:         req.body.dob,
            country:     req.body.country,
            gender:      req.body.gender,
        };

        let user = new User(document);
        user.save(function(error){
            console.log(user);
            if(error){
                throw error;
            }
            res.json({message : "Data saved successfully.", status : "success"});
        });
    }
});

function findUserByEmail(email){

    if(email){
        return new Promise((resolve, reject) => {
            User.findOne({ email: email })
                .exec((err, doc) => {
                    if (err) return reject(err);
                    if (doc) return reject(new Error('This email already exists. Please enter another email.'));
                    else return resolve(email);
                })
        })
    }
}

router.post('/login', function(req, res, next) {
    // console.log('USER ', User.find());

    User.findOne({email: req.body.email})
        .exec((err, doc) => {
            if (err) console.log(err);
            console.log('FINDDOC', doc);
            if (doc) {
                hmac = crypto.createHmac("sha1", 'auth secret');
                hmac.update(req.body.password);
                encpassword = hmac.digest("hex");

                console.log('the doc',doc);

                    if (encpassword === doc.password) {
                        console.log('CORRECT PASSWORD');
                        req.session.user_id = doc._id;
                        req.session.username = doc.full_name;
                        req.session.email = doc.email;
                        req.session.logged = true;
                        return res.redirect('/');
                    } else {
                        console.log('INCORRECT PASSWORD');
                    }
            } else {
                console.log('this e-mail doesn\'t exist');
                res.json({message: {msg:"This e-mail doesn't exist"}, status : "error"});
            }
        });
});

router.post('/logout', function(req, res, next) {
    req.session.user_id = null;
    req.session.email = null;
    req.session.logged = false;
    return res.redirect('/');
});

module.exports = router;
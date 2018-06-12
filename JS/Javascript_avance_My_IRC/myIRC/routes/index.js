let express = require('express');
let router = express.Router();

let mongoose  = require('mongoose');
let Channel = mongoose.model('Channels');

// let server = Server(app);
// let sio = require("socket.io")(server);
//
// let sessionMiddleware = session({
//     store: new RedisStore({}), // XXX redis server config
//     secret: "keyboard cat",
// });

// sio.use(function(socket, next) {
//     sessionMiddleware(socket.request, socket.request.res, next);
// });

/* GET home page. */
router.get('/', (req, res, next) => {

    let logged = (req.session.user_id != null);
    console.log(req.session);
    res.render('index', { title: 'My IRC', session: logged, username: req.session.username});

});

module.exports = router;

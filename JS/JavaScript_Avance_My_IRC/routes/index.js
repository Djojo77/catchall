let express = require('express');
let router = express.Router();

let mongoose  = require('mongoose');
let Channel = mongoose.model('Channels');

/* GET home page. */
router.get('/', (req, res, next) => {
    let channels;
    Channel.find()
        .exec((err, doc) => {
            if (err) console.log(err);
            if (doc) channels = doc;
            let logged = (req.session.user_id != null);
            res.render('index', {title: 'My IRC', session: logged, username: req.session.username, channels: channels});
        });

});

router.get('/test2', (req, res, next) => {
    let channels;
    Channel.find()
        .exec((err, doc) => {
            if (err) console.log(err);
            if (doc) channels = doc;
            let logged = (req.session.user_id != null);
            res.render('index', {title: 'My IRC', session: logged, username: req.session.username, channels: channels});
        });

});

router.post('/', (req, res, next) => {

    Channel.findOne({channelName: req.body.channelName})
        .exec((err, doc) => {
            if (err) console.log(err);
            if (doc) {
                res.json({message: "Channel already exist", status: "Exist"})
            }
            else {
                let today = Date.now();
                let document = {
                    channelName: req.body.channelName,
                    created_at: today,
                    updated_at: today,
                };
                let channel = new Channel(document);
                channel.save((error, doc) => {
                    console.log(channel);
                    if (error) {
                        throw error;
                    }
                    res.json({message: "Data saved successfully.", status: "success", channel: doc});
                });
            }

        });
    // let today = Date.now();
    //
    // let document = {
    //     channelName: req.body.channelName,
    //     created_at: today,
    //     updated_at: today,
    // };
    //
    // let channel = new Channel(document);
    // channel.save(function(error){
    //     console.log(channel);
    //     if(error){
    //         throw error;
    //     }
    //     res.json({message : "Data saved successfully.", status : "success"});
    // });
});

router.post('/getChannels', (req, res, next) => {
    Channel.find()
        .exec((err, doc) => {
           if (err) throw err;
           if (doc) res.json(doc);
        });
});

module.exports = router;

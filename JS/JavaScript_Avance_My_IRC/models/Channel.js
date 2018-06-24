let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let channelSchema = new Schema({
    channelName: { type: String,  required: [true, 'Full name must be provided'] },
    created_at: { type: Date , required: [true, 'Date of creation must be provided'] },
    updated_at: { type: Date , required: [true, 'Date of last update'] },
});

module.exports = mongoose.model('Channels', channelSchema);
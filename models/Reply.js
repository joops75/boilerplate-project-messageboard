const mongoose = require('mongoose');
const { Schema } = mongoose;

const repliesSchema = new Schema({
    text: String,
    created_on: { type: Date, default: new Date() },
    reported: { type: Boolean, default: false },
    delete_password: String
});

module.exports = mongoose.model('Reply', repliesSchema);
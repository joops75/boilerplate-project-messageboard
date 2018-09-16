const mongoose = require('mongoose');
const { Schema } = mongoose;

const boardsSchema = new Schema({
    board: String,
    threads: [{ type: Schema.Types.ObjectId, ref: 'Thread' }]
});

module.exports = mongoose.model('Board', boardsSchema);
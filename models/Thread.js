const mongoose = require('mongoose');
const { Schema } = mongoose;

const threadsSchema = new Schema({
    text: String,
    created_on: { type: Date, default: new Date() },
    bumped_on: { type: Date, default: new Date() },
    reported: { type: Boolean, default: false },
    delete_password: String,
    replies: [{ type: Schema.Types.ObjectId, ref: 'Reply' }],
    replycount: { type: Number, default: 0 },
    board: String
});

threadsSchema.pre('remove', function(next) {
    const Reply = mongoose.model('Reply');
    const Board = mongoose.model('Board');
    const replyPromise = Reply.deleteMany({ _id: { $in: this.replies } });
    const boardPromise = Board.findOneAndUpdate({ board: this.board }, { $pull: { threads: this._id } });
    Promise.all([replyPromise, boardPromise])
        .then(() => next())
        .catch(err => { throw err });
});

module.exports = mongoose.model('Thread', threadsSchema);
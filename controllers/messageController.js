const Reply = require('../models/Reply');
const Thread = require('../models/Thread');
const Board = require('../models/Board');

module.exports = {
    getIndexPage(req, res) {
        res.sendFile(process.cwd() + '/views/index.html');
    },
    getBoard(req, res) {
      res.sendFile(process.cwd() + '/views/board.html');
    },
    getBoardItems(req, res) {
        const { board } = req.params;
        Board.findOne({ board }, (err, data) => {
            if (err) throw err;
            if (data) {
                Thread.populate(data, [{ path: 'threads', options: { sort: { bumped_on: -1 }, limit: 10 }, populate: { path: 'replies', options: { sort: { created_on: -1 }, limit: 3 } } }])
                    .then(arr => { res.send(arr.threads) })
                    .catch(err => { throw err; });
            } else {
                Board.create({ board }, (err, info) => {
                    if (err) throw err;
                    res.send(info.threads);
                })
            }
        });
    },
    getThread(req, res) {
        res.sendFile(process.cwd() + '/views/thread.html');
    },
    getReplies(req, res) {
        const { board } = req.params;
        const { thread_id } = req.query;
        Thread.findById(thread_id)
            .populate({ path: 'replies', options: { sort: { created_on: -1 } } })
            .then(data => { res.send(data); })
            .catch(err => { throw err; });
    },
    postThread(req, res) {
        const { board } = req.params;
        const { text, delete_password } = req.body;
        Thread.create({ text, delete_password, replies: [], board }, (err, data) => {
            if (err) throw err;
            Board.findOneAndUpdate({ board }, { $push: { threads: data } }, { new: true, upsert: true }, err => {
                if (err) throw err;
                res.redirect('/b/' + board);
            })
        });
    },
    postReply(req, res) {
        const { board } = req.params;
        const { text, delete_password, thread_id } = req.body;
        Reply.create({ text, delete_password }, (err, data) => {
            if (err) throw err;
            Thread.findByIdAndUpdate(thread_id, { $push: { replies: data }, $inc: { replycount: 1 }, $set: { bumped_on: new Date() } }, { new: true }, err => {
                if (err) throw err;
                res.redirect('/b/' + board + '/' + thread_id);
            })
        });
    },
    deleteThread(req, res) {
        const { board } = req.params;
        const { thread_id, delete_password } = req.body;
        Thread.findById(thread_id, (err, data) => {
            if (err) throw err;
            if (data.delete_password !== delete_password) {
                return res.send('incorrect password');
            }
            data.remove()
                .then(() => { res.send('success'); })
                .catch(err => { throw err; })
        });
    },
    deleteReply(req, res) {
        const { board } = req.params;
        const { thread_id, reply_id, delete_password } = req.body;
        Reply.findById(reply_id, (err, data) => {
            if (err) throw err;
            if (data.delete_password !== delete_password) {
                return res.send('incorrect password');
            }
            data.text = '[deleted]';
            data.save()
                .then(() => { res.send('success'); })
                .catch(err => { throw err; })
        })
    },
    reportThread(req, res) {
        const { board } = req.params;
        const { thread_id } = req.body;
        Thread.findByIdAndUpdate(thread_id, { $set: { reported: true } }, err => {
            if (err) throw err;
            res.send('success');
        });
    },
    reportReply(req, res) {
        const { board } = req.params;
        const { thread_id, reply_id } = req.body;
        Reply.findByIdAndUpdate(reply_id, { $set: { reported: true } }, err => {
            if (err) throw err;
            res.send('success');
        })
    }
}
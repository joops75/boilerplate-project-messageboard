/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;

var messageController = require('../controllers/messageController');

module.exports = function (app) {
  
  app.post('/api/threads/:board', messageController.postThread);

  app.post('/api/replies/:board', messageController.postReply);
  
  app.get('/', messageController.getIndexPage);
  
  app.get('/b/:board/', messageController.getBoard);
  
  app.get('/api/threads/:board', messageController.getBoardItems);
  
  app.get('/b/:board/:threadid', messageController.getThread);
    
  app.get('/api/replies/:board', messageController.getReplies);

  app.delete('/api/threads/:board', messageController.deleteThread);

  app.delete('/api/replies/:board', messageController.deleteReply);

  app.put('/api/threads/:board', messageController.reportThread);

  app.put('/api/replies/:board', messageController.reportReply);

};

/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .get((req, res) => {
      // send html file
      res.sendfile(process.cwd() + '/views/thread.html')
    })
    
  app.route('/api/replies/:board')
    .get((req, res) => {
      // send html file
      res.sendfile(process.cwd() + '/views/board.html')
    })

};

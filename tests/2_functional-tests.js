/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var { assert } = chai;
var server = require('../server');

const Browser = require('zombie');
const mongoose = require('mongoose');

Browser.site = process.env.HOME_URL;
let browser;
const Thread = mongoose.model('Thread');

chai.use(chaiHttp);


suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('Post to test board', function(done) {
        chai.request(server)
          .post('/api/threads/test')
          .send({
            text: 'Hi there',
            delete_password: '123'
          })
          .end((err, res) => {
            Thread.findOne({ text: 'Hi there' }, (err, doc) => {
              if (err) {
                assert.fail();
                return done();
              }
              assert.equal(doc.text, 'Hi there', 'text inserted');
              assert.equal(doc.delete_password, '123', 'password inserted');
              done();
            })
          })
      });
    });

    suite('GET', function() {
      browser = new Browser();
      suiteSetup(function(done) {
        return browser.visit('/b/test', done);
      });
      
      test('Get posted thread info', function(done) {
        browser.assert.text('.main h3', 'Hi there');
        done();
      });
    });
    //put and delete test suites reversed
    suite('PUT', function() {
      // browser = new Browser();
      suiteSetup(function(done) {
        return browser.visit('/b/test', done);
      });
      
      test('Report thread', function(done) {
        browser.pressButton('form#reportThread input', () => {
          browser.assert.success();
          Thread.findOne({ text: 'Hi there' }, (err, doc) => {
            if (err) {
              assert.fail();
              return done();
            }
            assert.equal(doc.text, 'Hi there', 'text inserted');
            assert.isTrue(doc.reported);
            done();
          })
        });
      });
    });
    
    suite('DELETE', function() {
      // browser = new Browser();
      suiteSetup(function(done) {
        return browser.visit('/b/test', done);
      });
      
      test('Delete thread', function(done) {
        browser.fill('delete_password', '123')
        browser.pressButton('form#deleteThread submit', () => {
          browser.assert.success();
          Thread.findOne({ text: 'Hi there' }, (err, doc) => {
            if (err) {
              assert.fail();
              return done();
            }
            assert.isNull(doc);
            done();
          })
        });
      });
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {    
    browser = new Browser();
    beforeEach(function(done) {
      return browser.visit('/b/test', done);
    });

    suiteSetup(function(done) {
      chai.request(server)
        .post('/api/threads/test')
        .send({
          text: 'Ho ho ho',
          delete_password: '456'
        })
        .end(() => {
          done();
        });
    });
    
    suite('POST', function() {
      suiteSetup(function(done) {
        browser.pressButton('.replies h5 a', () => {
          browser.fill('#newReply textarea', 'Great reply');
          browser.fill('#newReply input', 'password');
          browser.pressButton('#newReply input submit', () => {
            done();
          });
        })
      });
      
      test('Post reply', function(done) {
        browser.assert.text('#deleteReply p', 'Great reply');
        Reply.findOne({ text: 'Great reply' }, (err, doc) => {
          if (err) {
            assert.fail();
            return done();
          }
          assert.equal(doc.text, 'Great reply');
          assert.equal(doc.delete_password, 'password');
          done();
        })
      });
    });
    
    suite('GET', function() {
      test('Get reply', done => {
        chai.request(server)
          .get('/api/replies/test')
          .end((err, res) => {
            chai.assert.equal(res.replies[0].text, 'Great reply');
            done();
          });
      })
    });
    
    suite('PUT', function() {
      suiteSetup(function(done) {
        browser.pressButton('.replies h5 a', () => {
          done();
        })
      });
      test('Report reply', done => {
        browser.pressButton('#reportReply input submit', () => {
          Reply.findOne({ text: 'Great reply' }, (err, doc) => {
            if (err) {
              assert.fail();
              return done();
            }
            chai.assert.isTrue(doc.reported);
            done();
          });
        });
      })
    });
    
    suite('DELETE', function() {
      suiteSetup(function(done) {
        browser.pressButton('.replies h5 a', () => {
          done();
        })
      });
      test('Delete reply', done => {
        browser.fill('#deleteReply input delete_password', 'password');
        browser.pressButton('#deleteReply input submit', () => {
          browser.assert.success();
          browser.visit('/b/test', () => {
            browser.assert.text('#deleteReply p', '[deleted]');
            done();
          });
        });
      });
    });
    
  });

});

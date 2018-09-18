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
const Thread = mongoose.model('Thread');
const Reply = mongoose.model('Reply');

Browser.site = process.env.HOME_URL;
let browser;
let thread_id;

chai.use(chaiHttp);

before(function(done) {
  browser = new Browser();
  mongoose.connection.dropDatabase();
  mongoose.connect(process.env.MONGO_URL_TEST, { useNewUrlParser: true });
  mongoose.connection
    .once('open', () => { done(); })
    .on('error', err => {
        console.warn(err);
    });
});

beforeEach(function(done) {
  return browser.visit('/b/test', done);
});


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
          .end(() => {
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
      
      test('Get posted thread info', function(done) {
        browser.assert.text('.main h3', 'Hi there');
        done();
      });
    });
    //put and delete test suites reversed
    suite('PUT', function() {
      
      test('Report thread', function(done) {
        browser.pressButton('Report', () => {
          browser.assert.success();
          Thread.findOne({ text: 'Hi there' }, (err, doc) => {
            if (err) {
              assert.fail();
              return done();
            }
            assert.isTrue(doc.reported);
            done();
          })
        });
      });
    });
    
    suite('DELETE', function() {
      
      test('Delete thread', function(done) {
        thread_id = browser.evaluate('document.querySelector("a").href').split('/').reverse()[0];
        chai.request(server)
          .del('/api/threads/test')
          .send({ thread_id, delete_password: '123' })
          .end(() => {
            Thread.findById(thread_id, (err, doc) => {
              if (err) {
                assert.fail();
                return done();
              }
              assert.isNull(doc);
              done();
            });
          })
        // can't get code below to work, after 'pressButton' is executed, req.body remains as an empty object
        // const threadURL = browser.evaluate('document.querySelector("a").href');
        // browser.visit(threadURL, () => {
        //   browser.fill('input[name=delete_password]', '123')
        //   const enteredPassword = browser.evaluate('document.getElementsByTagName("input")[3].value')
        //   browser.pressButton('Delete', () => {
        //     console.log('check')
        //     browser.assert.success();
        //     Thread.findOne({ text: 'Hi there' }, (err, doc) => {
        //       if (err) {
        //         assert.fail();
        //         return done();
        //       }
        //       assert.isNull(doc);
        //       done();
        //     })
        //   });
        // });
      });
    });

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    // insert a new thread into empty database
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
      
      test('Post reply', function(done) {
        const textarea = browser.evaluate('document.getElementsByTagName("textarea")[1]');
        browser.fill(textarea, 'Great reply');
        const deleteInputBox = browser.evaluate('document.getElementsByTagName("input")[8]');
        browser.fill(deleteInputBox, '789');
        const submitButton = browser.evaluate('document.getElementsByTagName("input")[9]');
        browser.pressButton(submitButton, () => {
          Reply.findOne({ text: 'Great reply' }, (err, doc) => {
            if (err) {
              assert.fail();
              return done();
            }
            assert.equal(doc.delete_password, '789');
            done();
          })
        });
      });
    });
    
    suite('GET', function() {
      test('Get reply', done => {
        thread_id = browser.evaluate('document.querySelector("a").href').split('/').reverse()[0];
        chai.request(server)
          .get('/api/replies/test?thread_id=' + thread_id)
          .end((err, res) => {
            assert.equal(res.body.replies[0].text, 'Great reply');
            done();
          });
      })
    });
    
    suite('PUT', function() {
      
      test('Report reply', done => {
        thread_id = browser.evaluate('document.querySelector("a").href').split('/').reverse()[0];
        browser.visit('/b/test/' + thread_id, () => {
          const reportButton = browser.evaluate('document.getElementsByTagName("input")[7]');
          browser.pressButton(reportButton, () => {
            Reply.findOne({ text: 'Great reply' }, (err, doc) => {
              if (err) {
                assert.fail();
                return done();
              }
              assert.isTrue(doc.reported);
              done();
            });
          });
        })
      })
    });
    
    suite('DELETE', function() {
      test('Delete reply', done => {
        const reply_id = browser.evaluate('document.getElementsByTagName("p")[1].textContent').split(' ')[1];
        chai.request(server)
          .del('/api/replies/test')
          .send({
            reply_id,
            delete_password: '789'
          })
          .end(() => {
            Reply.findById(reply_id, (err, doc) => {
              if (err) {
                assert.fail();
                return done;
              }
              assert.equal(doc.text, '[deleted]')
              done();
            })
          });
        // can't get code below to work, after 'pressButton' is executed, req.body remains as an empty object
        // browser.visit('/b/test/' + thread_id, () => {
        //   const passwordBox = browser.evaluate('document.getElementsByTagName("input")[10]');
        //   browser.fill(passwordBox, '789');
        //   const deleteButton = browser.evaluate('document.getElementsByTagName("input")[11]');
        //   console.log('passwordBox', passwordBox.name)
        //   console.log('deleteButton', deleteButton.value)
        //   browser.pressButton(deleteButton, () => {
        //     Reply.findOne({ delete_password: '789' }, (err, doc) => {
        //       if (err) {
        //         assert.fail();
        //         return done;
        //       }
        //       assert.equal(doc.text, '[deleted]')
        //       done();
        //     })
        //   });
        // });
      });
    });
    
  });

});

var Twitter = require('twitter');
var Emoji = require('node-emoji');
var Env = require('node-env-file');
var Pool = require('pg').Pool;
var Async = require('async');

var postgres_pool = new Pool({
  user: 'postgres', //env var: PGUSER
  database: 'angela', //env var: PGDATABASE
  password: '', //env var: PGPASSWORD
  host: 'db', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 10000, // how long a client is allowed to remain idle before being closed
});

Env(__dirname + '/.env');

var twitter_client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

function post_tweet(screen_name, tweet_id, callback) {
  twitter_client.post('statuses/update', {status: '@' + screen_name + ' ' + Emoji.random().emoji, in_reply_to_status_id: tweet_id},  function(err, tweet, response){
    console.log(tweet.id_str);

    if (err) throw err;

    callback();
  });
}

function save_tweet_id(tweet_id, callback) {
  postgres_pool.query('INSERT INTO tweets(tweet_id) VALUES($1)', [tweet_id], function (err, result) {
    if (err) throw err;

    callback()
  });
}

function get_new_mention_id(callback1, callback2) {
  postgres_pool.query('SELECT MAX(tweet_id) AS tweet_id FROM tweets', null, function (err, result) {

    console.log(result.rows[0]);

    if (err) throw err;

    var last_id = result.rows[0]['tweet_id'];

    if (last_id) {
      var params = {since_id: last_id};
    } else {
      var params = {}
    }
    twitter_client.get('statuses/mentions_timeline', params, function(error, tweets, response) {
      if (!error) {
        if (!tweets[0]) {
          setTimeout(handle_tweets, 60000);
        } else {
          console.log(tweets[0].id_str, tweets[0].user.screen_name, tweets[0].text);

          Async.series([
            function(callback) { callback1(tweets[0].id_str, callback) },
            function(callback) { callback2(tweets[0].user.screen_name, tweets[0].id_str, callback) }
          ], function (err, results) {
            console.log(results);

            setTimeout(handle_tweets, 60000);
          });
        }
      }
    });
  });
}

function handle_tweets() {
  get_new_mention_id(save_tweet_id, post_tweet);
}

handle_tweets();

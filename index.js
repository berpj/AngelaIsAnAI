var Twitter = require('twitter');
var Emoji = require('node-emoji');
var Env = require('node-env-file');

Env(__dirname + '/.env');

var client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

var params = {};
client.get('statuses/mentions_timeline', params, function(error, tweets, response) {
  if (!error) {
    console.log(tweets[0].id_str, tweets[0].user.screen_name, tweets[0].text);

    client.post('statuses/update', {status: '@' + tweets[0].user.screen_name + ' ' + Emoji.random().emoji, in_reply_to_status_id: tweets[0].id_str},  function(error, tweet, response){
      if (!error){
        console.log(tweet.id_str);
      } else {
        console.log (error)
      }
    });
  }
});

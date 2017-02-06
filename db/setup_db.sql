DROP DATABASE if exists angela;

CREATE DATABASE angela owner postgres;
\connect angela

CREATE TABLE tweets(
  id bigserial primary key,
  tweet_id text
);
CREATE INDEX tweets_tweet_id ON tweets USING btree (tweet_id);

CREATE TABLE "users" (
    "userid" bigint PRIMARY KEY,
    "token" text,
    "first_name" text,
    "last_name" text,
    "screen_name" text UNIQUE,
    "email" text,
    "picture" text
);

CREATE TABLE conversations (
	id SERIAL NOT NULL PRIMARY KEY,
	conversation_key VARCHAR,
	from_userid BIGINT,
	to_userid BIGINT,
  last_message TIMESTAMP DEFAULT NULL
);

CREATE TABLE messages (
	id SERIAL NOT NULL PRIMARY KEY,
	conversation_key VARCHAR,
	message TEXT,
	datetime_sent TIMESTAMP,
	datetime_read TIMESTAMP DEFAULT NULL,
	sent_by BIGINT REFERENCES users (userid)
);

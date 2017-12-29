CREATE TABLE users (
	id SERIAL NOT NULL PRIMARY KEY,
	name VARCHAR,
	email VARCHAR,
	screen_name VARCHAR,
	active BOOLEAN DEFAULT true
);

CREATE TABLE conversations (
	id SERIAL NOT NULL PRIMARY KEY,
	conversation_key VARCHAR,
	from_userid INTEGER,
	to_userid INTEGER
);

CREATE TABLE messages (
	id SERIAL NOT NULL PRIMARY KEY,
	conversation_key VARCHAR,
	message TEXT,
	datetime_sent TIMESTAMP,
	sent_by INTEGER REFERENCES users (id)
);

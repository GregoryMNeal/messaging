CREATE TABLE users (
	id SERIAL NOT NULL PRIMARY KEY,
	name VARCHAR,
	email VARCHAR,
	screen_name VARCHAR,
	active BOOLEAN DEFAULT true
);

CREATE TABLE messages (
	id SERIAL NOT NULL PRIMARY KEY,
	message_key VARCHAR,
	message TEXT,
	datetime_sent TIMESTAMP,
	users_id INTEGER REFERENCES users (id)
);

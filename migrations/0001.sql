CREATE TABLE users (
	id SERIAL NOT NULL PRIMARY KEY,
	name VARCHAR,
	email VARCHAR,
	screen_name VARCHAR,
	active BOOLEAN DEFAULT true
);

CREATE TABLE messages (
	id SERIAL NOT NULL PRIMARY KEY,
	from_user INTEGER,
	to_user INTEGER,
	message TEXT,
	message_sent_datetime TIMESTAMP
);

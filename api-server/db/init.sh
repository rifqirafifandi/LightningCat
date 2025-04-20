#!/bin/bash

psql -U lightningcatuser -d lightningcat <<EOF

CREATE TYPE facility_name AS ENUM (
  'Queenstown Sports Centre', 'Choa Chu Kang Sports Centre', 'Yishun Swimming Complex',
  'Jurong West Sports Centre', 'Jalan Besar Sports Centre', 'Bedok Stadium',
  'Burghley Squash and Tennis Centre', 'Toa Payoh Sports Centre', 'Sengkang Sports Centre',
  'Geylang Field', 'Heartbeat@Bedok', 'Katong Swimming Complex',
  'Bukit Gombak Sports Centre', 'Enabling Village Gym', 'Serangoon Sports Centre',
  'Woodlands Sports Centre', 'Jurong Stadium', 'Yio Chu Kang Sports Centre',
  'Kallang Sports Centre', 'Kallang Basin Swimming Complex', 'Clementi Sports Centre',
  'Jurong East Sports Centre', 'Delta Sports Centre', 'Geylang East Swimming Complex',
  'Pasir Ris Sports Centre', 'AMK Swimming Complex', 'Bishan Sports Centre',
  'Farrer Park Field and Tennis Centre', 'Co Curricular Activities Branch',
  'Hougang Sports Centre', 'Bukit Batok Swimming Complex', 'St Wilfrid Sports Centre',
  'Clementi Stadium', 'Our Tampines Hub - Community Auditorium', 'Yishun Sports Centre'
);

CREATE TYPE activity_type AS ENUM (
  'Football', 'Badminton', 'Athletics', 'Table_tennis', 'Hockey', 'Volleyball',
  'Soccer', 'Petanque', 'Basketball', 'Swimming', 'Pickleball', 'Lawn_bowl',
  'Gym', 'Tennis', 'Indoor', 'Gateball', 'Wading', 'Netball', 'Squash', 'Rugby'
);

CREATE TYPE listing_status AS ENUM ('open', 'full', 'cancelled', 'completed');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'rejected', 'cancelled');
CREATE TYPE payment_status AS ENUM ('unpaid', 'paid', 'refunded');
CREATE TYPE wallet_status AS ENUM ('active', 'suspended', 'closed');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'payment', 'refund', 'fee', 'commission', 'deduction');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'reversed', 'canceled');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE profiles (
  id INTEGER PRIMARY KEY REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  profile_image TEXT,
  preferences JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE oauth_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  provider VARCHAR(50) NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  UNIQUE(provider, provider_user_id)
);

CREATE TABLE listings (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL REFERENCES users(id),
  activity activity_type NOT NULL,
  facility_name facility_name NOT NULL,
  venue VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  duration INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  fee DECIMAL(12,2) NOT NULL,
  status listing_status DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  listing_id INTEGER NOT NULL REFERENCES listings(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  booking_status booking_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'unpaid',
  fee DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(listing_id, user_id)
);

CREATE TABLE wallet (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(3) NOT NULL DEFAULT 'SGD',
  status wallet_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  wallet_id INTEGER NOT NULL REFERENCES wallet(id),
  booking_id INTEGER REFERENCES bookings(id),
  listing_id INTEGER REFERENCES listings(id),
  amount DECIMAL(12,2) NOT NULL,
  transaction_type transaction_type NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  reference VARCHAR(255),
  description TEXT,
  payment_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

EOF

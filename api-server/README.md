# api-server

## Routes

Server is at [https://api.chucklenuts.party](https://api.chucklenuts.party)

### Auth

#### Cognito
- [https://api.chucklenuts.party/auth/cognito/login](https://api.chucklenuts.party/auth/cognito/login)
- [https://api.chucklenuts.party/refresh](https://api.chucklenuts.party/refresh)

#### Google OAuth
- [https://api.chucklenuts.party/auth/google/login](https://api.chucklenuts.party/auth/google/login)

#### Unified logout
- [https://api.chucklenuts.party/auth/logout](https://api.chucklenuts.party/auth/logout)

### API

#### Testing & debugging
- GET `https://api.chucklenuts.party/health` - check if API is alive
- GET `https://api.chucklenuts.party` - check if you're authenticated

#### User & profile
- GET `https://api.chucklenuts.party/profile` - get profile with session cookie
- POST `https://api.chucklenuts.party/profile` - Update profile with formData

##### Listing
- GET `https://api.chucklenuts.party/listing/:listingId` - get single listing by listing_id
- PUT `https://api.chucklenuts.party/listing/:listingId` - update single listing by listing_id
- GET `https://api.chucklenuts.party/listings/:userId` - get user_id's listings
- GET `https://api.chucklenuts.party/listings` - get all listings
- POST `https://api.chucklenuts.party/listing` - create listing

##### Booking
- GET `https://api.chucklenuts.party/booking/:bookingId` - get single booking by booking_id
- PUT `https://api.chucklenuts.party/booking/:bookingId` - update single booking by booking_id
- GET `https://api.chucklenuts.party/bookings/:userId` - get user_id's bookings
- GET `https://api.chucklenuts.party/bookings` - get all bookings
- POST `https://api.chucklenuts.party/booking` - create booking

##### Wallet
- GET `https://api.chucklenuts.party/wallet` - get wallet with session cookie

##### Transaction
- GET `https://api.chucklenuts.party/transaction/:transactionId` - get single transaction with transaction_id
- POST `https://api.chucklenuts.party/transaction` - create transaction
- GET `https://api.chucklenuts.party/transactions` - get all transactions with session cookie

##### Webhook (Payments)
- POST `https://api.chucklenuts.party/webhook/payment` - Confirmation of payment by provider

[Stripe docs for webhooks](https://docs.stripe.com/webhooks?lang=python)
[Types of Events](https://docs.stripe.com/api/events/types)

-----

## Data Model
Reference: [app/models/user.py](app/models/user.py)

### users
| key | type |
| ------------- | ------------- |
| `id` | SERIAL PRIMARY KEY |
| `email` | VARCHAR(255) NOT NULL UNIQUE |

### profiles
| key | type |
| ------------- | ------------- |
| `id` | INTEGER PRIMARY KEY REFERENCES users(id) |
| `name` | VARCHAR(255) NOT NULL |
| `profile_image` | TEXT |
| `preferences` | JSONB DEFAULT '{}'::jsonb |

### oauth_accounts
| key | type |
| ------------- | ------------- |
| `id` | SERIAL PRIMARY KEY |
| `user_id` | INTEGER NOT NULL REFERENCES users(id) |
| `provider` | VARCHAR(50) NOT NULL |
| `provider_user_id` | VARCHAR(255) NOT NULL |
|| UNIQUE(provider, provider_user_id) |

Reference: [app/models/listing.py](app/models/listing.py)

### listings
| key | type |
| ------------- | ------------- |
| `id` | SERIAL PRIMARY KEY |
| `owner_id` | INTEGER NOT NULL REFERENCES users(id) |
| `activity` | activity_type NOT NULL |
| `facility_name` | facility_name NOT NULL |
| `venue` | VARCHAR(255) NOT NULL |
| `date` | DATE NOT NULL |
| `duration` | INTEGER NOT NULL |
| `capacity` | INTEGER NOT NULL |
| `fee` | INTEGER NOT NULL |
| `status` | listing_status DEFAULT 'open' |
| `created_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP |

Reference: [app/models/booking.py](app/models/booking.py)

### bookings
| key | type |
| ------------- | ------------- |
| `id` | SERIAL PRIMARY KEY |
| `listing_id` | INTEGER NOT NULL REFERENCES listings(id) |
| `user_id` | INTEGER NOT NULL REFERENCES users(id) |
| `booking_status` | booking_status DEFAULT 'pending' |
| `payment_status` | payment_status DEFAULT 'unpaid' |
| `fee` | INTEGER NOT NULL |
| `created_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP |
|| UNIQUE(listing_id, user_id) |

Reference: [app/models/wallet.py](app/models/wallet.py)

### wallet
| key | type |
| ------------- | ------------- |
| `id` | SERIAL PRIMARY KEY |
| `user_id` | INTEGER NOT NULL REFERENCES users(id) |
| `balance` | DECIMAL(12,2) NOT NULL DEFAULT 0.00 |
| `currency` | VARCHAR(3) NOT NULL DEFAULT 'SGD' |
| `status` | wallet_status NOT NULL DEFAULT 'active' |
| `created_at` | TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP |

Reference: [app/models/transactions.py](app/models/transactions.py)

### transactions
| key | type |
| ------------- | ------------- |
| `id` | SERIAL PRIMARY KEY |
| `wallet_id` | INTEGER NOT NULL REFERENCES wallet(id) |
| `booking_id` | INTEGER REFERENCES bookings(id) |
| `listing_id` | INTEGER REFERENCES listings(id) |
| `amount` | DECIMAL(12,2) NOT NULL |
| `transaction_type` | transaction_type NOT NULL |
| `status` | transaction_status NOT NULL DEFAULT 'pending' |
| `reference` | VARCHAR(255) |
| `description` | TEXT |
| `metadata` | JSONB DEFAULT '{}'::jsonb |
| `created_at` | TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP |

## postgresql ENUM types

| enum | types |
| ------------- | ------------- |
| `facility_name` | `Queenstown Sports Centre`, `Choa Chu Kang Sports Centre`, `Yishun Swimming Complex`, `Jurong West Sports Centre`, `Jalan Besar Sports Centre`, `Bedok Stadium`, `Burghley Squash and Tennis Centre`, `Toa Payoh Sports Centre`, `Sengkang Sports Centre`, `Geylang Field`, `Heartbeat@Bedok`, `Katong Swimming Complex`, `Bukit Gombak Sports Centre`, `Enabling Village Gym`, `Serangoon Sports Centre`, `Woodlands Sports Centre`, `Jurong Stadium`, `Yio Chu Kang Sports Centre`, `Kallang Sports Centre`, `Kallang Basin Swimming Complex`, `Clementi Sports Centre`, `Jurong East Sports Centre`, `Delta Sports Centre`, `Geylang East Swimming Complex`, `Pasir Ris Sports Centre`, `AMK Swimming Complex`, `Bishan Sports Centre`, `Farrer Park Field and Tennis Centre`, `Co Curricular Activities Branch`, `Hougang Sports Centre`, `Bukit Batok Swimming Complex`, `St Wilfrid Sports Centre`, `Clementi Stadium`, `Our Tampines Hub - Community Auditorium`, `Yishun Sports Centre` |
| `activity_type` | `Football`, `Badminton`, `Athletics`, `Table_tennis`, `Hockey`, `Volleyball`, `Soccer`, `Petanque`, `Basketball`, `Swimming`, `Pickleball`, `Lawn_bowl`, `Gym`, `Tennis`, `Indoor`, `Gateball`, `Wading`, `Netball`, `Squash`, `Rugby` |
| `listing_status` | `open`, `full`, `cancelled`, `completed` |
| `booking_status` | `pending`, `confirmed`, `rejected`, `cancelled` |
| `payment_status` | `unpaid`, `paid`, `refunded` |
| `wallet_status` | `active`, `suspended`, `closed` |
| `transaction_type` | `deposit`, `withdrawal`, `payment`, `refund`, `fee`, `commission` |
| `transaction_status` | `pending`, `completed`, `failed`, `reversed`, `canceled` |

-----

## Setup instructions

```sh
# setup venv
sudo apt install python3-venv
# create a virtual env folder right here in api-server/
python3 -m venv api-server-venv
# activate venv
source api-server-venv/bin/activate
# install Flask
pip install flask uwsgi authlib requests flask-session redis
```

## On the cloud

### Components

- Flask app (Python3.9) [main.py](main.py)
- Redis
- Postgresql
- uWSGI
- nginx (reverse-proxy)

All components have been configured as systemd services that run on startup.

Config locations on the server (copied here for reference):
- [/etc/systemd/system/api-server.service](systemd-config/api-server.service)
- [/etc/nginx/nginx.conf](systemd-config/nginx.conf)
- [/etc/redis/redis.conf](systemd-config/redis.conf)

## Logging

```sh
tail -f /opt/api-server/uwsgi.log
```

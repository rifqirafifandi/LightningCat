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
- [https://api.chucklenuts.party/logout](https://api.chucklenuts.party/logout)

### API

- GET [https://api.chucklenuts.party/health](https://api.chucklenuts.party/health)
- GET [https://api.chucklenuts.party/profile](https://api.chucklenuts.party/profile)
- POST [https://api.chucklenuts.party/profile/image](https://api.chucklenuts.party/profile/image)
- PUT [https://api.chucklenuts.party/profile/name](https://api.chucklenuts.party/profile/name)
- PUT [https://api.chucklenuts.party/profile/preferences](https://api.chucklenuts.party/profile/preferences)

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

### listings
| key | type |
| ------------- | ------------- |
| `id` | SERIAL PRIMARY KEY |
| `owner_id` | INTEGER NOT NULL REFERENCES users(id) |
| `facility_name` | VARCHAR(255) NOT NULL |
| `activity` | activity_type NOT NULL |
| `start_time` | TIMESTAMP NOT NULL |
| `end_time` | TIMESTAMP NOT NULL |
| `capacity` | INTEGER NOT NULL |
| `price` | DECIMAL(10,2) |
| `status` | listing_status DEFAULT 'open' |
| `created_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP |

### bookings
| key | type |
| ------------- | ------------- |
| `id` | SERIAL PRIMARY KEY |
| `listing_id` | INTEGER NOT NULL REFERENCES listings(id) |
| `user_id` | INTEGER NOT NULL REFERENCES users(id) |
| `booking_status` | booking_status DEFAULT 'pending' |
| `payment_status` | payment_status DEFAULT 'unpaid' |
| `amount` | DECIMAL(10,2) |
| `created_at` | TIMESTAMP DEFAULT CURRENT_TIMESTAMP |
|| UNIQUE(listing_id, user_id) |

## postgresql ENUM types

| enum | types |
| ------------- | ------------- |
| `facility_name` | `Queenstown Sports Centre`, `Choa Chu Kang Sports Centre`, `Yishun Swimming Complex`, `Jurong West Sports Centre`, `Jalan Besar Sports Centre`, `Bedok Stadium`, `Burghley Squash and Tennis Centre`, `Toa Payoh Sports Centre`, `Sengkang Sports Centre`, `Geylang Field`, `Heartbeat@Bedok`, `Katong Swimming Complex`, `Bukit Gombak Sports Centre`, `Enabling Village Gym`, `Serangoon Sports Centre`, `Woodlands Sports Centre`, `Jurong Stadium`, `Yio Chu Kang Sports Centre`, `Kallang Sports Centre`, `Kallang Basin Swimming Complex`, `Clementi Sports Centre`, `Jurong East Sports Centre`, `Delta Sports Centre`, `Geylang East Swimming Complex`, `Pasir Ris Sports Centre`, `AMK Swimming Complex`, `Bishan Sports Centre`, `Farrer Park Field and Tennis Centre`, `Co Curricular Activities Branch`, `Hougang Sports Centre`, `Bukit Batok Swimming Complex`, `St Wilfrid Sports Centre`, `Clementi Stadium`, `Our Tampines Hub - Community Auditorium`, `Yishun Sports Centre` |
| `activity_type` | `Football`, `Badminton`, `Athletics`, `Table_tennis`, `Hockey`, `Volleyball`, `Soccer`, `Petanque`, `Basketball`, `Swimming`, `Pickleball`, `Lawn_bowl`, `Gym`, `Tennis`, `Indoor`, `Gateball`, `Wading`, `Netball`, `Squash`, `Rugby` |
| `listing_status` | `open`, `full`, `cancelled`, `completed` |
| `booking_status` | `pending`, `confirmed`, `rejected`, `cancelled` |
| `payment_status` | `unpaid`, `paid`, `refunded` |

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

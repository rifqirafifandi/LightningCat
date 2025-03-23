# api-server

## Routes

Server is at [https://api.chucklenuts.party](https://api.chucklenuts.party)

- [https://api.chucklenuts.party/login](https://api.chucklenuts.party/login)
- [https://api.chucklenuts.party/logout](https://api.chucklenuts.party/logout)
- [https://api.chucklenuts.party/refresh](https://api.chucklenuts.party/refresh)

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
- [/etc/systemd/system/api-server.service](config/api-server.service)
- [/etc/nginx/nginx.conf](config/nginx.conf)
- [/etc/redis/redis.conf](config/redis.conf)

## Logging

```sh
tail -f /opt/api-server/uwsgi.log
```

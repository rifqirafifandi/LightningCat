# api-server

## Getting started (local dev)

```sh
# setup venv
sudo apt install python3-venv
# create a virtual env folder right here in api-server/
python3 -m venv api-server-venv
# activate venv
source api-server-venv/bin/activate
# install Flask (you don't need uwsgi for local dev, so ignore requirements.txt)
pip install flask
# run the app
python main-local-dev.py
```

## On the cloud

### Components

- Flask app (Python3.9) [main.py](main.py)
- uWSGI
- nginx (reverse-proxy)

Both nginx and uWSGI have been configured as systemd services that run on startup.

Config locations on the server (copied here for reference):
- [/etc/systemd/system/api-server.service](config/api-server.service)
- [/etc/nginx/nginx.conf](config/nginx.conf)

When you're SSH'ed into the server, run `curl http://localhost` to test that the app is running and proxied correctly.
Do the same from the frontend server, run `curl http://172.31.26.190` to test that you can get a response.

## Security Groups

The backend server's SG has 3 rules:
1. TCP 22 from `0.0.0.0/0`
2. TCP 80 from `sg-02fafdd09c384d8e5` (basically frontend-server's SG)
3. TCP 80 from `0.0.0.0/0`

Rule #3 is temporary and should be removed ASAP along with its public IP from nginx.conf. The long-term setup is to only allow Port 80 connections from frontend-sever's private IP address.

## Logging

Debug logging has been enabled on the flask, you can tail the log file on the server while testing stuff:

```sh
tail -f /home/ec2-user/api-server/uwsgi.log
```

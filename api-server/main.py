from flask import Flask, jsonify, redirect, url_for, session, Blueprint, request
from authlib.integrations.flask_client import OAuth
import os
import json, logging
from werkzeug.middleware.proxy_fix import ProxyFix
from functools import wraps
import secrets
from flask_session import Session
from datetime import timedelta

app = Flask(__name__)
app.logger.setLevel(logging.DEBUG)

app.secret_key = os.urandom(24)

# Session via Redis
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_PERMANENT'] = True
app.config['SESSION_USE_SIGNER'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)
app.config['SESSION_REDIS'] = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
Session(app)

# Cognito configuration
REGION = 'ap-southeast-1'
USER_POOL_ID = 'ap-southeast-1_gizY1x2zX'
CLIENT_ID = '3s5teo690r892rfp9pg22q77ob'
CLIENT_SECRET = os.environ.get('COGNITO_CLIENT_SECRET')
REDIRECT_URI = 'https://api.chucklenuts.party/callback'
COGNITO_DOMAIN = f'https://cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}'

oauth = OAuth(app)
oauth.register(
  name='cognito',
  client_id=CLIENT_ID,
  client_secret=CLIENT_SECRET,
  server_metadata_url=f'{COGNITO_DOMAIN}/.well-known/openid-configuration',
  client_kwargs={'scope': 'email openid'},
  authorize_params={
    'response_type': 'code',
    'redirect_uri': REDIRECT_URI
  }
)

# blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

app.wsgi_app = ProxyFix(
  app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1
)

# Authentication decorator
def login_required(f):
  @wraps(f)
  def decorated_function(*args, **kwargs):
    if 'user' not in session:
      return redirect(url_for('login'))
    return f(*args, **kwargs)
  return decorated_function

# Routes
@app.route('/')
def index():
  user = session.get('user')
  if user:
    return jsonify({"message": "You are logged in", "user": user})
  return jsonify({"message": "You are not logged in"})

@app.route('/login')
def login():
  try:
    nonce = secrets.token_urlsafe(16)
    state = secrets.token_urlsafe(16)
    session['nonce'] = nonce
    session['state'] = state
  
    return oauth.cognito.authorize_redirect(
      redirect_uri=REDIRECT_URI,
      nonce=nonce,
      state=state
    )
  except Exception as e:
    app.logger.error(f"Login error: {str(e)}")
    return jsonify({"error": "Authentication service unavailable"}), 503

@app.route('/callback')
def callback():
  try:
    # Verify state to prevent CSRF
    expected_state = session.pop('state', None)
    received_state = request.args.get('state')

    if not expected_state or expected_state != received_state:
      raise ValueError("Invalid state parameter")
    
    nonce = session.pop('nonce', None)
    token = oauth.cognito.authorize_access_token()
    userinfo = oauth.cognito.parse_id_token(token, nonce=nonce)

    session['user'] = userinfo
    session['access_token'] = token.get('access_token')
    session['refresh_token'] = token.get('refresh_token')
    session['id_token'] = token.get('id_token')
    session['token_expiry'] = token.get('expires_at', 0)

    # You can store additional user info if needed
    return redirect(url_for('profile'))
  except ValueError as e:
    app.logger.error(f"Security validation error: {str(e)}")
    return jsonify({"error": "Security validation failed"}), 403
  except Exception as e:
    app.logger.error(f"Callback error: {str(e)}")
    return jsonify({"error": "Authentication failed"}), 400

@app.route('/profile')
@login_required
def profile():
  return jsonify(session['user'])

@app.route('/logout')
def logout():
  session.clear()

  # Redirect to Cognito logout
  logout_url = (
    f"https://{USER_POOL_ID}.auth.{REGION}.amazoncognito.com/logout"
    f"?client_id={CLIENT_ID}"
    f"&logout_uri=https://api.chucklenuts.party/"
  )

  return redirect(logout_url)

@app.route('/refresh')
def refresh_token():
  if 'refresh_token' not in session:
    return jsonify({"error": "No refresh token available"}), 401

  try:
    token = oauth.cognito.refresh_token(refresh_token=session['refresh_token'])
    session['access_token'] = token.get('access_token')
    session['id_token'] = token.get('id_token')
    session['token_expiry'] = token.get('expires_at', 0)

    return jsonify({"message": "Token refreshed successfully"})
  except Exception as e:
    app.logger.error(f"Token refresh error: {str(e)}")
    session.clear()
    return jsonify({"error": "Failed to refresh token, please login again"}), 401

app.register_blueprint(auth_bp)

if __name__ == "__main__":
  app.run(host='0.0.0.0')

import secrets
from functools import wraps
from flask import session, jsonify

def login_required(f):
  @wraps(f)
  def decorated_function(*args, **kwargs):
    if 'user' not in session:
      return jsonify({"error": "Authentication required"}), 401
    return f(*args, **kwargs)
  return decorated_function

def generate_security_tokens():
  nonce = secrets.token_urlsafe(16)
  state = secrets.token_urlsafe(16)
  return nonce, state

def store_tokens_in_session(provider, nonce, state):
  session[f'{provider}_nonce'] = nonce
  session[f'{provider}_state'] = state

def get_tokens_from_session(provider):
  nonce = session.pop(f'{provider}_nonce', None)
  state = session.pop(f'{provider}_state', None)
  return nonce, state

def store_user_in_session(userinfo, token, provider):
  session['user'] = userinfo
  session['provider'] = provider
  session['access_token'] = token.get('access_token')
  session['refresh_token'] = token.get('refresh_token', None)
  session['id_token'] = token.get('id_token', None)
  session['token_expiry'] = token.get('expires_at', 0)

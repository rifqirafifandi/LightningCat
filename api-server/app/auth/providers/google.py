from flask import Blueprint, jsonify, redirect, url_for, session, current_app, request
from app.extensions import oauth
from app.auth.utils import generate_security_tokens, store_tokens_in_session, get_tokens_from_session, store_user_in_session

google_bp = Blueprint('google', __name__, url_prefix='/auth/google')

@google_bp.route('/login')
def login():
  try:
    nonce, state = generate_security_tokens()
    store_tokens_in_session('google', nonce, state)

    # Register Google OAuth client if not already registered
    if 'google' not in oauth.clients:
      oauth.register(
        name='google',
        client_id=current_app.config['GOOGLE_CLIENT_ID'],
        client_secret=current_app.config['GOOGLE_CLIENT_SECRET'],
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={'scope': 'openid email'},
      )

    return oauth.google.authorize_redirect(
      redirect_uri=current_app.config['GOOGLE_REDIRECT_URI'],
      state=state
    )
  except Exception as e:
    current_app.logger.error(f"Google login error: {str(e)}")
    return jsonify({"error": "Authentication service unavailable"}), 503

@google_bp.route('/callback')
def callback():
  try:
    # CSRF
    _, expected_state = get_tokens_from_session('google')
    received_state = request.args.get('state')

    if not expected_state or expected_state != received_state:
        raise ValueError("Invalid state parameter")

    token = oauth.google.authorize_access_token()

    # Get user info from userinfo endpoint
    resp = oauth.google.get('userinfo')
    userinfo = resp.json()

    store_user_in_session(userinfo, token, 'google')

    return redirect(url_for('api.profile'))
  except ValueError as e:
    current_app.logger.error(f"Google security validation error: {str(e)}")
    return jsonify({"error": "Security validation failed"}), 403
  except Exception as e:
    current_app.logger.error(f"Google callback error: {str(e)}")
    return jsonify({"error": "Authentication failed"}), 400

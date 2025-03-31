from flask import Blueprint, jsonify, redirect, url_for, session, current_app, request
from app.models.user import User, Profile, OAuthAccount
from app.extensions import oauth, db
from app.auth.utils import generate_security_tokens, store_tokens_in_session, get_tokens_from_session, store_user_in_session

cognito_bp = Blueprint('cognito', __name__, url_prefix='/auth/cognito')

@cognito_bp.route('/login')
def login():
  try:
    nonce, state = generate_security_tokens()
    store_tokens_in_session('cognito', nonce, state)

    return oauth.cognito.authorize_redirect(
      redirect_uri=current_app.config['COGNITO_REDIRECT_URI'],
      nonce=nonce,
      state=state
    )
  except Exception as e:
    current_app.logger.error(f"Cognito login error: {str(e)}")
    return jsonify({"error": "Authentication service unavailable"}), 503

@cognito_bp.route('/callback')
def callback():
  try:
    # CSRF
    nonce, expected_state = get_tokens_from_session('cognito')
    received_state = request.args.get('state')

    if not expected_state or expected_state != received_state:
      raise ValueError("Invalid state parameter")

    token = oauth.cognito.authorize_access_token()
    userinfo = oauth.cognito.parse_id_token(token, nonce=nonce)

    provider_user_id = userinfo['sub']
    email = userinfo['email']

    user = OAuthAccount.get_user_by_provider_details('cognito', provider_user_id)

    if not user:
      user = User.get_or_create(email)
      oauth_account = OAuthAccount(
        user_id=user.id,
        provider='cognito',
        provider_user_id=provider_user_id
      )
      db.session.add(oauth_account)

      profile = Profile.get_or_create(user.id, email) # default name in profile to email address

      db.session.commit()

    store_user_in_session(userinfo, token, 'cognito')
    session['internal_user_id'] = user.id

    return redirect(current_app.config['WEB_REDIRECT_URI'])
  except ValueError as e:
    current_app.logger.error(f"Cognito security validation error: {str(e)}")
    return jsonify({"error": "Security validation failed"}), 403
  except Exception as e:
    current_app.logger.error(f"Cognito callback error: {str(e)}")
    return jsonify({"error": "Authentication failed"}), 400

@cognito_bp.route('/refresh')
def refresh_token():
  if 'refresh_token' not in session or session.get('provider') != 'cognito':
    return jsonify({"error": "No valid Cognito refresh token available"}), 401

  try:
    token = oauth.cognito.refresh_token(refresh_token=session['refresh_token'])
    session['access_token'] = token.get('access_token')
    session['id_token'] = token.get('id_token')
    session['token_expiry'] = token.get('expires_at', 0)

    return jsonify({"message": "Token refreshed successfully"})
  except Exception as e:
    current_app.logger.error(f"Cognito token refresh error: {str(e)}")
    session.clear()
    return jsonify({"error": "Failed to refresh token, please login again"}), 401

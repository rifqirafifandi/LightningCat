from flask import redirect, session, current_app
from app.auth import auth_bp

@auth_bp.route('/logout')
def logout():
  provider = session.get('provider')
  session.clear()

  if provider == 'cognito':
    logout_url = (
      f"https://{current_app.config['COGNITO_HOSTED_DOMAIN']}/logout"
      f"?client_id={current_app.config['COGNITO_CLIENT_ID']}"
      f"&logout_uri={current_app.config['COGNITO_LOGOUT_URI']}"
    )
    return redirect(logout_url)
  else:
    return redirect(current_app.config['WEB_REDIRECT_URI'])

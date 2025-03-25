from flask import redirect, url_for, session, current_app
from app.auth import auth_bp

@auth_bp.route('/logout')
def logout():
  provider = session.get('provider')
  session.clear()

  if provider == 'cognito':
    logout_url = (
      f"https://{current_app.config['COGNITO_HOSTED_DOMAIN']}/logout"
      f"?client_id={current_app.config['COGNITO_CLIENT_ID']}"
      f"&logout_uri={current_app.config['BASE_URL']}"
    )
    return redirect(logout_url)
  else:
    return redirect(url_for('api.index'))

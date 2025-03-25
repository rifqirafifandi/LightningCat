from flask import Flask
from werkzeug.middleware.proxy_fix import ProxyFix

from app.extensions import oauth, session, db, migrate
from app.config import config_by_env
from app.auth import auth_bp
from app.auth.providers.cognito import cognito_bp
from app.auth.providers.google import google_bp
from app.api import api_bp

def create_app(config_name=None):
  app = Flask(__name__)

  # Load configuration
  if config_name is None:
    config_name = 'production'
  app.config.from_object(config_by_env[config_name])

  # Configure logging
  import logging
  app.logger.setLevel(logging.DEBUG)

  # Initialize extensions
  session.init_app(app)
  oauth.init_app(app)
  db.init_app(app)
  migrate.init_app(app, db)

  # Apply middleware
  app.wsgi_app = ProxyFix(
    app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1
  )

  # Register blueprints
  app.register_blueprint(auth_bp)
  app.register_blueprint(cognito_bp)
  app.register_blueprint(google_bp)
  app.register_blueprint(api_bp)

  return app

import os
from datetime import timedelta

class Config:
  SECRET_KEY = os.urandom(24)
  
  # Database configuration
  SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
  SQLALCHEMY_TRACK_MODIFICATIONS = False

  # Session configuration
  SESSION_TYPE = 'redis'
  SESSION_PERMANENT = True
  SESSION_USE_SIGNER = True
  SESSION_PERMANENT_LIFETIME = timedelta(days=1)
  SESSION_REDIS = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
  SESSION_COOKIE_DOMAIN = '.chucklenuts.party'
  SESSION_COOKIE_NAME = 'session'
  SESSION_COOKIE_SECURE = True
  SESSION_COOKIE_HTTPONLY = True
  SESSION_COOKIE_SAMESITE = 'Lax'

  # AWS Cognito configuration
  AWS_REGION = os.environ.get('AWS_REGION', 'ap-southeast-1')
  COGNITO_USER_POOL_ID = os.environ.get('COGNITO_USER_POOL_ID', 'ap-southeast-1_gizY1x2zX')
  COGNITO_CLIENT_ID = os.environ.get('COGNITO_CLIENT_ID', '3s5teo690r892rfp9pg22q77ob')
  COGNITO_CLIENT_SECRET = os.environ.get('COGNITO_CLIENT_SECRET')
  BASE_URL = os.environ.get('BASE_URL', 'https://api.chucklenuts.party')
  COGNITO_REDIRECT_URI = f"{BASE_URL}/auth/cognito/callback"
  COGNITO_DOMAIN = f"https://cognito-idp.{AWS_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}"
  COGNITO_HOSTED_DOMAIN = f"{COGNITO_USER_POOL_ID}.auth.{AWS_REGION}.amazoncognito.com"

  # Google Auth configuration
  GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
  GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
  GOOGLE_REDIRECT_URI = f"{BASE_URL}/auth/google/callback"

  # App config
  MAX_PROFILE_IMAGE_FILE_SIZE = 2 * 1024 * 1024  # 2MB
  WEB_REDIRECT_URI = os.environ.get('WEB_REDIRECT_URI', 'https://web.chucklenuts.party')

class DevelopmentConfig(Config):
  DEBUG = True
  SESSION_COOKIE_SECURE = False

class ProductionConfig(Config):
  DEBUG = False

class TestingConfig(Config):
  TESTING = True
  SESSION_COOKIE_SECURE = False

config_by_env = {
  'development': DevelopmentConfig,
  'production': ProductionConfig,
  'testing': TestingConfig,
}

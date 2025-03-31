from flask import jsonify, session
from app.api import api_bp
import base64

@api_bp.route('/')
def index():
  user = session.get('user')
  if user:
    return jsonify({"message": "You are logged in", "user": user})
  return jsonify({"message": "You are not logged in"})

@api_bp.route('/health')
def health_check():
  return jsonify({"status": "healthy"}), 200

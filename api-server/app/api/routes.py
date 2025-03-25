from flask import jsonify, session
from app.api import api_bp
from app.auth.utils import login_required

@api_bp.route('/')
def index():
  user = session.get('user')
  if user:
    return jsonify({"message": "You are logged in", "user": user})
  return jsonify({"message": "You are not logged in"})

@api_bp.route('/profile')
@login_required
def profile():
  return jsonify(session['user'])

@api_bp.route('/health')
def health_check():
  return jsonify({"status": "healthy"}), 200

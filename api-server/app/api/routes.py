from PIL import Image
import io
import re
import base64
from flask import jsonify, session, request, current_app
from app.api import api_bp
from app.auth.utils import login_required
from app.models.user import User, Profile
from app.extensions import db
import base64

@api_bp.route('/')
def index():
  user = session.get('user')
  if user:
    return jsonify({"message": "You are logged in", "user": user})
  return jsonify({"message": "You are not logged in"})

@api_bp.route('/profile', methods=['GET'])
@login_required
def profile():
  user_id = session.get('internal_user_id')

  if not user_id:
    return jsonify({"error": "User not found in session"}), 401

  user = User.query.get(user_id)

  if not user:
    return jsonify({"error": "User not found"}), 404

  profile = Profile.query.get(user_id)
  if not profile:
    return jsonify({"error": "Profile not found"}), 404

  response = {
    "profile_image": profile.profile_image,
    "name": profile.name,
    "email": user.email,
    "preferences": profile.preferences or {}
  }

  return jsonify(response)

@api_bp.route('/profile', methods=['POST'])
@login_required
def update_profile():
  user_id = session.get('internal_user_id')

  if not user_id:
    return jsonify({"error": "User not found in session"}), 401

  user = User.query.get(user_id)

  if not user:
    return jsonify({"error": "User not found"}), 404

  profile = Profile.query.get(user_id)
  if not profile:
    return jsonify({"error": "Profile not found"}), 404

  # finally get data
  try:
    data = request.json

    if not data:
      return jsonify({"error": "No data provided"}), 400
    
    base64_string = data.get('profile_image')
    name = data.get('name')
    preferences = data.get('preferences')

    # validate base64 image
    if base64_string:
      try:
        # extract the base64 part of the image data
        base64_data = re.sub('^data:image/.+;base64,', '', base64_string)
        # Decode the base64 image
        image_data = base64.b64decode(base64_data)
        # Check if the image is valid by trying to open it with PIL
        image = Image.open(io.BytesIO(image_data))
        image.verify()  # Verify that it is an image
      except Exception as e:
        current_app.logger.error(f"Invalid image data: {str(e)}")
        return jsonify({"error": "Invalid image data"}), 400

      profile.profile_image = base64_data
    
    # validate name VARCHAR(255)
    if name:
      if len(name) > 255:
        return jsonify({"error": "Name is too long"}), 400
      profile.name = name
    
    # validate preferences JSON
    if preferences:
      if not isinstance(preferences, dict):
        return jsonify({"error": "Preferences must be a JSON object"}), 400
      profile.preferences = preferences

    # commit changes to the database
    db.session.commit()
    
    return jsonify({
      "message": "Profile updated successfully",
      "profile_image": profile.profile_image,
      "name": profile.name,
      "email": user.email,
      "preferences": profile.preferences or {}
    })
  except Exception as e:
    current_app.logger.error(f"Error updating profile: {str(e)}")
    return jsonify({"error": "An error occurred while updating the profile"}), 500

@api_bp.route('/health')
def health_check():
  return jsonify({"status": "healthy"}), 200

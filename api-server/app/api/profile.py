from PIL import Image
import io, re, base64, json
from flask import jsonify, session, request, current_app
from app.api import api_bp
from app.auth.utils import login_required
from app.models.user import User, Profile
from app.extensions import db
import base64

@api_bp.route('/profile', methods=['OPTIONS'])
def profile_options():
    return '', 200

@api_bp.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
  user_id = session.get('internal_user_id')

  user = User.query.get(user_id)

  if not user:
    return jsonify({"error": "User not found"}), 404

  profile = Profile.query.get(user_id)
  if not profile:
    return jsonify({"error": "Profile not found"}), 404
  
  if request.method == 'GET':
    response = {
      "id": user.id,
      "profile_image": profile.profile_image,
      "name": profile.name,
      "email": user.email,
      "preferences": profile.preferences or { 'activities': [], 'facilities': [] }
    }

    return jsonify(response)
  
  if request.method == 'POST':
    try:
      base64_string = request.form.get('profile_image')
      name = request.form.get('name')
      preferences_str = request.form.get('preferences')
      preferences = json.loads(preferences_str) if preferences_str else {}

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

        profile.profile_image = base64_string
      
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
        "ok": True,
        "message": "Profile updated successfully",
        "profile_image": profile.profile_image,
        "name": profile.name,
        "email": user.email,
        "preferences": profile.preferences or {}
      })
    except Exception as e:
      current_app.logger.error(f"Error updating profile: {str(e)}")
      return jsonify({"error": "An error occurred while updating the profile"}), 500

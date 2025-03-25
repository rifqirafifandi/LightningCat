from PIL import Image
import io
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

@api_bp.route('/profile')
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

@api_bp.route('/profile/image', methods=['POST'])
@login_required
def update_profile_image():
  user_id = session.get('internal_user_id')

  if not user_id:
    return jsonify({"error": "User not found in session"}), 401

  profile = Profile.query.get(user_id)
  if not profile:
    return jsonify({"error": "Profile not found"}), 404

  if 'image' not in request.files:
    return jsonify({"error": "No image provided"}), 400

  file = request.files['image']
  if file.filename == '':
    return jsonify({"error": "No image selected"}), 400

  allowed_extensions = {'png', 'jpg', 'jpeg'}
  filename = file.filename

  if '.' not in filename or filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
    return jsonify({
      "error": "Invalid file extension",
      "message": "Only PNG, JPG, JPEG, and GIF files are allowed"
    }), 415

  if not file.content_type.startswith('image/'):
    return jsonify({
      "error": "Invalid file type",
      "message": "Only image files are allowed"
    }), 415

  file_content = file.read()

  if len(file_content) > current_app.config.get('MAX_PROFILE_IMAGE_FILE_SIZE', 2 * 1024 * 1024): # 2MB
    return jsonify({
      "error": "File too large", 
      "message": "Image size exceeds the 2MB limit"
  }), 413
  try:
    image = Image.open(io.BytesIO(file_content))
    output = io.BytesIO()

    # Convert to JPEG and optimize
    if image.mode != 'RGB':
      image = image.convert('RGB')

    image.save(output, format='JPEG', optimize=True, quality=85)
    processed_image = output.getvalue()

    image_data = base64.b64encode(processed_image).decode('utf-8')

  except Exception as e:
    current_app.logger.error(f"Image processing error: {str(e)}")
    return jsonify({
      "error": "Invalid image",
      "message": "The uploaded file could not be processed as an image"
    }), 400

  profile.profile_image = image_data
  db.session.commit()

  return jsonify({"message": "Profile image updated successfully"})

@api_bp.route('/profile/name', methods=['PUT'])
@login_required
def update_name():
  user_id = session.get('internal_user_id')

  if not user_id:
    return jsonify({"error": "User not found in session"}), 401

  profile = Profile.query.get(user_id)
  if not profile:
    return jsonify({"error": "Profile not found"}), 404

  if not request.is_json:
    return jsonify({"error": "Request must be JSON"}), 400

  data = request.get_json()
  if 'name' not in data:
    return jsonify({"error": "Name is required"}), 400

  profile.name = data['name']
  db.session.commit()

  return jsonify({"message": "Name updated successfully"})

@api_bp.route('/profile/preferences', methods=['PUT'])
@login_required
def update_preferences():
  user_id = session.get('internal_user_id')

  if not user_id:
    return jsonify({"error": "User not found in session"}), 401

  profile = Profile.query.get(user_id)
  if not profile:
    return jsonify({"error": "Profile not found"}), 404

  if not request.is_json:
    return jsonify({"error": "Request must be JSON"}), 400

  preferences = request.get_json()

  profile.preferences = preferences
  db.session.commit()

  return jsonify({"message": "Preferences updated successfully"})

@api_bp.route('/health')
def health_check():
  return jsonify({"status": "healthy"}), 200

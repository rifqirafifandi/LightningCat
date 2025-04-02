from flask import jsonify, session, request
from app.api import api_bp
from app.auth.utils import login_required
from app.models.listing import Listing

@api_bp.route('/listing', methods=['OPTIONS'])
def listing_options():
  return '', 200

@api_bp.route('/listing/<listing_id>', methods=['GET', 'PUT'])
@login_required
def get_listing(listing_id):
  # Check if listing ID is provided
  if not listing_id:
    return jsonify({'error': 'Listing ID is required'}), 400

  listing = Listing.get_single_listing(listing_id)
  if not listing:
    return jsonify({}), 204
  
  # Check if the listing belongs to the current user
  if listing.user_id != session['internal_user_id']:
    return jsonify({'error': 'Unauthorized access to listing'}), 403
  
  if request.method == 'GET':
    return jsonify(listing.to_dict()), 200

  if request.method == 'PUT':
    updated_listing = Listing.update_listing(listing_id, request.json.get('status'))
    if not updated_listing:
      return jsonify({'error': 'Listing not found'}), 404
    
    return jsonify(updated_listing.to_dict()), 200

@api_bp.route('/listing', methods=['POST'])
@login_required
def create_listing():
  data = {}
  data['activity'] = request.form.get('activity')
  data['facility_name'] = request.form.get('facility_name')
  data['venue'] = request.form.get('venue')
  data['date'] = request.form.get('date')
  data['duration'] = request.form.get('duration')
  data['capacity'] = request.form.get('capacity')
  data['fee'] = request.form.get('fee')

  # Validation
  required_fields = ['activity', 'facility_name', 'venue', 'date', 'duration', 'capacity', 'fee']
  missing_fields = [field for field in required_fields if field not in data or not data[field]]
  if missing_fields:
    return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

  try:
    duration = int(data['duration']) if data['duration'] else None
    capacity = int(data['capacity']) if data['capacity'] else None
    fee = int(data['fee']) if data['fee'] else None
    
    new_listing = Listing.create_listing(
      user_id=session['internal_user_id'],
      activity=data['activity'],
      facility_name=data['facility_name'],
      venue=data['venue'],
      date=data['date'],
      duration=duration,
      capacity=capacity,
      fee=fee,
      status=data.get('status', 'open')
    )

    return jsonify(new_listing.to_dict()), 201

  except Exception as e:
    return jsonify({'error': str(e)}), 400

@api_bp.route('/listings/<user_id>', methods=['GET'])
@login_required
def get_user_listings(user_id):
  # Check if user ID is provided
  if not user_id:
    return jsonify({'error': 'User ID is required'}), 400

  # Get the listings for the user
  user_listings = Listing.get_user_listings(user_id)
  if not user_listings:
    return jsonify([]), 204

  return jsonify([listing.to_dict() for listing in user_listings]), 200

@api_bp.route('/listings', methods=['GET'])
def get_all_listings():
  all_listings = Listing.get_all_listings()
  if not all_listings:
    return jsonify([]), 204

  return jsonify([listing.to_dict() for listing in all_listings]), 200

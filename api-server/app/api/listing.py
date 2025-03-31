from flask import jsonify, session, request
from app.api import api_bp
from app.auth.utils import login_required
from app.models.listing import Listing

@api_bp.route('/listing', methods=['OPTIONS'])
def listing_options():
  return '', 200

@api_bp.route('/listing/<listing_id>', methods=['GET'])
@login_required
def get_listing(listing_id):
  # Check if listing ID is provided
  if not listing_id:
    return jsonify({'error': 'Listing ID is required'}), 400

  # Get the listing
  listing = Listing.get_single_listing(listing_id)
  if not listing:
    return jsonify({}), 204

  # Check if the listing belongs to the current user
  if listing.user_id != session['internal_user_id']:
    return jsonify({'error': 'Unauthorized access to listing'}), 403

  return jsonify(listing.to_dict()), 200

@api_bp.route('/listing', methods=['POST'])
@login_required
def create_listing():
  data = request.json

  # Validation
  required_fields = ['facility_name', 'activity', 'start_time', 'end_time', 'capacity']
  for field in required_fields:
    if field not in data:
      return jsonify({'error': f'Missing required field: {field}'}), 400

  try:
    new_listing = Listing.create_listing(
      user_id=data['user_id'],
      facility_name=data['facility_name'],
      activity=data['activity'],
      start_time=data['start_time'],
      end_time=data['end_time'],
      capacity=data['capacity'],
      price=data.get('price'),
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

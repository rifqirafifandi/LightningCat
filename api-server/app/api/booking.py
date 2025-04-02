from flask import jsonify, session, request
from app.api import api_bp
from app.auth.utils import login_required
from app.models.listing import Listing
from app.models.booking import Booking

@api_bp.route('/booking', methods=['OPTIONS'])
def booking_options():
  return '', 200

@api_bp.route('/booking/<booking_id>', methods=['GET'])
@login_required
def get_booking(booking_id):
  if not booking_id:
    return jsonify({'error': 'Booking ID is required'}), 400

  booking = Booking.get_single_booking(booking_id)
  if not booking:
    return jsonify({}), 204

  if booking.user_id != session['internal_user_id']:
    return jsonify({'error': 'Unauthorized access to booking'}), 403

  return jsonify(booking.to_dict()), 200

@api_bp.route('/booking', methods=['POST'])
@login_required
def create_booking():
  # Get data from request
  data = request.json

  # Validate required fields
  if 'listing_id' not in data:
    return jsonify({'error': 'Missing required field: listing_id'}), 400

  # Check if listing exists
  listing = Listing.get_single_listing(data['listing_id'])
  if not listing:
    return jsonify({'error': 'Listing not found'}), 404
  
  # Check if listing is available
  if listing.status != 'open':
    return jsonify({'error': 'This listing is not available for booking'}), 400

  # Check if listing is at capacity
  if hasattr(listing, 'bookings') and len(listing.bookings) >= listing.capacity:
    return jsonify({'error': 'This listing is already at full capacity'}), 400

  # Create the booking
  try:
    fee = int(data.get('fee', listing.fee)) if data.get('fee') else listing.fee // listing.capacity
    new_booking = Booking.create_booking(
      user_id=session['internal_user_id'],
      listing_id=data['listing_id'],
      fee=fee,
      booking_status=data.get('booking_status', 'pending'),
      payment_status=data.get('payment_status', 'unpaid')
    )

    if not new_booking:
      return jsonify({'error': 'Failed to create booking. You may already have a booking for this listing.'}), 400

    return jsonify(new_booking.to_dict()), 201

  except Exception as e:
    return jsonify({'error': str(e)}), 400

@api_bp.route('/bookings/<user_id>', methods=['GET'])
@login_required
def get_user_bookings(user_id):
  # Check if user_id is provided
  if not user_id:
    return jsonify({'error': 'User ID is required'}), 400

  # Get bookings for the user
  user_bookings = Booking.get_user_bookings(user_id)
  if not user_bookings:
    return jsonify([]), 204
  return jsonify([booking.to_dict() for booking in user_bookings]), 200

@api_bp.route('/bookings', methods=['GET'])
@login_required
def get_all_bookings():
  all_bookings = Booking.get_all_bookings()
  if not all_bookings:
    return jsonify([]), 204
  return jsonify([booking.to_dict() for booking in all_bookings]), 200

from flask import jsonify, session, request
from app.api import api_bp
from app.auth.utils import login_required
from app.models.listing import Listing
from app.models.booking import Booking
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.extensions import db

@api_bp.route('/booking', methods=['OPTIONS'])
def booking_options():
  return '', 200

@api_bp.route('/booking/<booking_id>', methods=['GET'])
@login_required
def get_booking(booking_id):
  if not booking_id:
    return jsonify({'error': 'Booking ID is required'}), 400

  booking = Booking.get_single_booking(booking_id)

  if booking.owner_id != session['internal_user_id']:
    return jsonify({'error': 'Unauthorized access to listing'}), 403
  
  if not booking:
    return jsonify({}), 204

  return jsonify(booking.to_dict()), 200

@api_bp.route('/booking', methods=['POST'])
@login_required
def create_booking():
  user_id = session.get('internal_user_id')
  if not user_id:
    return jsonify({"error": "User not found"}), 404
  
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
  
  # Check if user has enough balance in wallet
  wallet = Wallet.get_wallet(user_id)
  if not wallet:
    return jsonify({'error': 'Wallet not found for the given user ID'}), 404
  if wallet.balance < listing.fee:
    return jsonify({'error': 'Insufficient balance in wallet'}), 400
  
  # Create the booking
  try:
    new_booking = Booking.create_booking(
      user_id=session['internal_user_id'],
      listing_id=data['listing_id'],
      fee=listing.fee,
      booking_status=data.get('booking_status', 'pending'),
      payment_status=data.get('payment_status', 'unpaid')
    )

    if not new_booking:
      return jsonify({'error': 'Failed to create booking. You may already have a booking for this listing.'}), 400
    
    if hasattr(listing, 'bookings'):
      if len(listing.bookings) >= listing.capacity:
        listing.status = 'full'
        db.session.commit()
  
      # create transaction for booker
      transaction = Transaction.create_transaction(
        wallet_id=wallet.id,
        amount=listing.fee,
        transaction_type='payment',
        status='completed',
        booking_id=new_booking.id,
        listing_id=listing.id
      )
      if not transaction:
        return jsonify({'error': 'Failed to create transaction'}), 400
      # Update wallet balance
      wallet.balance -= listing.fee

      # Update booking
      new_booking.payment_status = 'paid'
      new_booking.booking_status = 'confirmed'

      try:
        # create tranasaction for listing owner
        listing_owner_wallet = Wallet.get_wallet(listing.owner_id)
        transaction = Transaction.create_transaction(
          wallet_id=listing_owner_wallet.id,
          amount=1.00, # constant commission fee
          transaction_type='deduction',
          status='completed',
          booking_id=new_booking.id,
          listing_id=listing.id,
          description='Commission fee of SGD 1.00 deducted from listing owner per booking'
        )
        listing_owner_wallet.balance -= 1.00
        db.session.commit()

      except Exception as e:
        return jsonify({'error': 'Failed to deduct commission from listing owner'}), 400

      db.session.commit()
    return jsonify(new_booking.to_dict()), 201

  except Exception as e:
    return jsonify({'error': str(e)}), 400

@api_bp.route('/bookings/<user_id>', methods=['GET'])
@login_required
def get_user_bookings(user_id):
  # Check if user_id is provided
  if not user_id:
    return jsonify({'error': 'User ID is required'}), 400
  
  # Check if the user_id matches the logged-in user
  if int(user_id) != session['internal_user_id']:
    return jsonify({'error': 'Unauthorized access to user bookings'}), 403

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

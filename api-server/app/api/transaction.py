from decimal import Decimal
from flask import jsonify, session, request
from app.api import api_bp
from app.auth.utils import login_required
from app.models.transaction import Transaction
from app.models.wallet import Wallet

@api_bp.route('/transaction', methods=['OPTIONS'])
def transaction_options():
  return '', 200

@api_bp.route('/transaction/<transaction_id>', methods=['GET'])
@login_required
def get_transaction(transaction_id):
  if not transaction_id:
    return jsonify({'error': 'Transaction ID is required'}), 400

  transaction = Transaction.get_transaction(transaction_id)

  if not transaction:
    return jsonify({}), 204

  return jsonify(transaction.to_dict()), 200

@api_bp.route('/transaction', methods=['POST'])
@login_required
def create_transaction():
  data = request.json
  user_id = session.get('internal_user_id')
  if not user_id:
    return jsonify({"error": "User not found"}), 404

  wallet = Wallet.get_wallet(user_id)
  if not wallet:
    return jsonify({'error': 'Wallet not found for the given internal user ID'}), 404

  # Validation
  required_fields = ['amount', 'transaction_type']
  missing_fields = [field for field in required_fields if field not in data or not data[field]]
  if missing_fields:
    return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

  try:
    amount_float = data.get('amount') / 100.0
    amount_float_str = str(amount_float)
    amount = Decimal(amount_float_str)

    transaction = Transaction.create_transaction(
      wallet_id=wallet.id,
      amount=amount,
      transaction_type=data.get('transaction_type'),
      status='completed', # assume completed
      booking_id=data.get('booking_id'),
      listing_id=data.get('listing_id'),
    )

    # Stripe SDK integration
    """
    payment_intent = stripe.PaymentIntent.create(
      amount=int(amount * 100),  # Amount in cents
      currency='usd',
      metadata={
        'transaction_id': transaction.id,
        'wallet_id': wallet.id,
        'listing_id': data.get('listing_id'),
        'booking_id': data.get('booking_id'),
      }
    )

    transaction.reference = payment_intent.id
    transaction.payment_metadata = {
      'payment_intent_id': payment_intent.id,
      'payment_intent_client_secret': payment_intent.client_secret,
    }
    transaction.save()
    """

    # assuming the transaction is created successfully for now
    Wallet.update_balance(wallet.id, amount)
    
    return jsonify(transaction.to_dict()), 201
  except Exception as e:
    return jsonify({'error': str(e)}), 500

@api_bp.route('/transactions', methods=['GET'])
@login_required
def get_transactions():
  user_id = session.get('internal_user_id')
  if not user_id:
    return jsonify({"error": "User not found"}), 404

  wallet = Wallet.get_wallet(user_id)
  if not wallet:
    return jsonify({'error': 'Wallet not found for the given internal user ID'}), 404

  transactions = Transaction.get_wallet_transactions(wallet.id)
  
  if not transactions:
    return jsonify([]), 204

  return jsonify([transaction.to_dict() for transaction in transactions]), 200

from flask import jsonify, request, current_app
import hmac
import hashlib
from app.api import api_bp
from app.models.transaction import Transaction
from app.models.wallet import Wallet

@api_bp.route('/webhook/payment', methods=['POST'])
def payment_webhook():
  webhook_secret = current_app.config.get('STRIPE_WEBHOOK_SECRET')
  payload = request.get_data()
  sig_header = request.headers.get('Stripe-Signature')

  if not sig_header:
    return jsonify({'error': 'Missing signature header'}), 400

  try:
    # Verify the signature
    computed_signature = hmac.new(
      webhook_secret.encode(),
      payload,
      hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(computed_signature, sig_header):
      return jsonify({'error': 'Invalid signature'}), 400

    event_data = request.json

    if event_data.get('type') == 'payment_intent.succeeded':
      return handle_payment_success(
        event_data.get('data', {}).get('object', {}).get('metadata', {}).get('wallet_id'),
        event_data.get('data', {}).get('object', {}).get('metadata', {}).get('transaction_id'),
        event_data.get('data', {}).get('object', {}).get('amount_received')
      )
    elif event_data.get('type') == 'payment_intent.canceled':
      return handle_payment_status_update(
        event_data.get('data', {}).get('object', {}).get('metadata', {}).get('transaction_id'),
        'canceled'
      )
  
    elif event_data.get('type') == 'payment_intent.payment_failed':
      return handle_payment_status_update(
        event_data.get('data', {}).get('object', {}).get('metadata', {}).get('transaction_id'),
        'failed'
      )
    
    elif event_data.get('type') == 'payment_intent.processing':
      return handle_payment_status_update(
        event_data.get('data', {}).get('object', {}).get('metadata', {}).get('transaction_id'),
        'pending'
      )

  except Exception as e:
    return jsonify({'error': str(e)}), 400

def handle_payment_success(wallet_id, transaction_id, amount_received):
  try:
    if wallet_id and amount_received:
      wallet = Wallet.query.get(wallet_id)
      if wallet:
        wallet.balance += amount_received
        wallet.save()

        transaction = Transaction.query.get(transaction_id)
        if transaction:
          transaction.status = 'completed'
          transaction.amount = amount_received
          transaction.save()

        return jsonify({'status': 'success'}), 200
    else:
      return jsonify({'error': 'Missing wallet ID or amount received'}), 400
  except Exception as e:
    current_app.logger.error(f"Error handling payment success: {str(e)}")
    return jsonify({'error': 'Failed to handle payment success'}), 500

def handle_payment_status_update(transaction_id, status):
  transaction = Transaction.query.get(transaction_id)
  if transaction:
    transaction.status = status
    transaction.save()
    return jsonify({'status': 'success'}), 200
  else:
    return jsonify({'error': 'Transaction not found'}), 404

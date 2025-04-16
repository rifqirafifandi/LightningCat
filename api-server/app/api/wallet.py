from flask import jsonify, session
from app.api import api_bp
from app.auth.utils import login_required
from app.models.wallet import Wallet

@api_bp.route('/wallet', methods=['OPTIONS'])
def wallet_options():
  return '', 200

@api_bp.route('/wallet', methods=['GET'])
@login_required
def get_wallet():
  user_id = session.get('internal_user_id')

  if not user_id:
    return jsonify({"error": "User not found"}), 404

  wallet = Wallet.get_wallet(user_id)

  if not wallet:
    return jsonify({"error": "Wallet not found"}), 404

  return jsonify(wallet.to_dict()), 200

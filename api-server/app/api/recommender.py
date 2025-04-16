from flask import jsonify
import requests
from app.api import api_bp

@api_bp.route('/recommender', methods=['OPTIONS'])
def recommender_options():
  return '', 200

@api_bp.route('/recommender', methods=['POST'])
def get_recommendation():
  proxied_url = 'http://13.251.208.162:8000/rec'
  try:
    response = requests.get(proxied_url, headers={'Accept': 'application/json'})
    if response.status_code != 200:
      return jsonify({'error': 'Failed to get recommendations'}), 500
    
    recommendations = response.json()
    return jsonify(recommendations), 200
  except requests.exceptions.RequestException as e:
    return jsonify({'error': str(e)}), 500

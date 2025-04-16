from flask import jsonify
import requests
from app.api import api_bp

@api_bp.route('/facilities', methods=['GET'])
def get_facilities():
  proxied_url = 'http://13.251.208.162:8000/facilities/'
  try:
    response = requests.get(proxied_url, headers={'Accept': 'application/json'})
    if response.status_code != 200:
      return jsonify({'error': 'Failed to fetch facilities'}), 500
    
    facilities = response.json()
    return jsonify(facilities), 200
  except requests.exceptions.RequestException as e:
    return jsonify({'error': str(e)}), 500

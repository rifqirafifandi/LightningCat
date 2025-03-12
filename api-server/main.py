from flask import Flask, jsonify
import json, logging
from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__)
app.logger.setLevel(logging.DEBUG)

app.wsgi_app = ProxyFix(
  app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1
)

@app.route('/')
def index():
  return "<h1>Hello world</h1>"

@app.route('/api/<path:filename>')
def send_file(filename):
  app.logger.debug(f"Route hit with filename: {filename}")
  try:
    with open(f'/home/ec2-user/api-server/data/{filename}.json', 'r') as f:
      data = json.load(f)
    return jsonify(data)
  except FileNotFoundError:
    return jsonify({'error': 'File not found'}), 404
  except json.JSOecodeError:
    return jsonify({'error': 'Invalid JSON file'}), 500

if __name__ == "__main__":
  app.run(host='0.0.0.0')

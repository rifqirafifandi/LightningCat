import sys
import os
from app import create_app

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

application = create_app()

if __name__ == "__main__":
  application.run(host='0.0.0.0', port=5000)

from flask import Blueprint

api_bp = Blueprint('api', __name__)

from app.api import routes
from app.api import profile
from app.api import booking
from app.api import listing

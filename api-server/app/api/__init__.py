from flask import Blueprint

api_bp = Blueprint('api', __name__)

from app.api import routes
from app.api import profile
from app.api import booking
from app.api import listing
from app.api import wallet
from app.api import transaction
from app.api import facility
from app.api import recommender

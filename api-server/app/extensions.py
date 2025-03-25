from flask_session import Session
from authlib.integrations.flask_client import OAuth
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

session = Session()
oauth = OAuth()
db = SQLAlchemy()
migrate = Migrate()

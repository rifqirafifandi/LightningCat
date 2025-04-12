from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
from pathlib import Path

import os

BASE_MODULE = Path(__file__).parent
ROOT = BASE_MODULE.parent

FACILITY_COLLECTION = "facility_collection"
USER_COLLECTION = "user_collection"

load_dotenv(dotenv_path=".env_local")

USE_DOCUMENT_DB = int(os.getenv("USE_DOCUMENT_DB"))
MONGODB_USER = os.getenv("MONGODB_USER")
MONGODB_PWD = os.getenv("MONGODB_PWD")
MONGODB_ADDRESS = os.getenv("MONGODB_ADDRESS")
MONGODB_APP = os.getenv("MONGODB_APP")
MONGODB_DOCDB_PWD = os.getenv("MONGODB_DOCDB_PWD")


uri = f"mongodb+srv://{MONGODB_USER}:{MONGODB_PWD}@{MONGODB_ADDRESS}/?retryWrites=true&w=majority&appName={MONGODB_APP}"

documentdb_uri = f"mongodb://khoa:{MONGODB_DOCDB_PWD}@ml-features.cp8e0gogko3z.ap-southeast-1.docdb.amazonaws.com:27017/?tls=true&tlsCAFile=global-bundle.pem&retryWrites=false"

if USE_DOCUMENT_DB == 1:
    uri = documentdb_uri

def get_db_client():


    client = MongoClient(uri)
    return client


class DB:
    def __init__(self):
        self.client = get_db_client()
        self.db = self.client.lightningcat_db
        if USE_DOCUMENT_DB == 1:
            print("Use DOCUMENT DB")
            self.db = self.client['ml-features']
        self.facility = self.db[FACILITY_COLLECTION]
        self.user = self.db[USER_COLLECTION]

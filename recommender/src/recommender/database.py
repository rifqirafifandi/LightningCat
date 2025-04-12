from pymongo import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
from pathlib import Path

import os

BASE_MODULE = Path(__file__).parent
ROOT = BASE_MODULE.parent

FACILITY_COLLECTION = "facility_collection"
USER_COLLECTION = "user_collection"


def get_db_client():
    load_dotenv(dotenv_path=".env_local")

    MONGODB_PWD = os.getenv("MONGODB_PWD")


    uri = f"mongodb://khoa:{MONGODB_PWD}@ml-features.cp8e0gogko3z.ap-southeast-1.docdb.amazonaws.com:27017/?tls=true&tlsCAFile=global-bundle.pem&retryWrites=false"

    client = MongoClient(uri, server_api=ServerApi("1"))
    return client


class DB:
    def __init__(self):
        self.client = get_db_client()
        self.db = self.client.lightningcat_db
        self.facility = self.db[FACILITY_COLLECTION]
        self.user = self.db[USER_COLLECTION]

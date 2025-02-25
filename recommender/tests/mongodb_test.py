from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=".env_local")

MONGODB_USER = os.getenv("MONGODB_USER")
MONGODB_PWD = os.getenv("MONGODB_PWD")


uri = f"mongodb+srv://{MONGODB_USER}:{MONGODB_PWD}@lightning-cat.0i8os.mongodb.net/?retryWrites=true&w=majority&appName=lightning-cat"
# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi("1"))
# Send a ping to confirm a successful connection
try:
    client.admin.command("ping")
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

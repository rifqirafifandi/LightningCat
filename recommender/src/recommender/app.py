from typing import List
from fastapi import FastAPI
from recommender.inference import Searcher
from pathlib import Path
from .model import User, Facility


MODEL_PATH = Path("output_index")


app = FastAPI(debug=True)
search_app: Searcher = Searcher.from_local_path(MODEL_PATH)
db = search_app.db


@app.get("/users/")
def get_users() -> List[User]:
    users = []
    for user in db.user.find():
        del user["_id"]
        users.append(user)
    return users


@app.get("/facilities")
def get_facilities() -> List[Facility]:
    facilities = []
    for facility in db.facility.find():
        del facility["_id"]
        facilities.append(facility)
    return facilities

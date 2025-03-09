from pathlib import Path

from fastapi import FastAPI

from recommender.inference import Searcher

from .model import Facility, User

MODEL_PATH = Path("output_index")


app = FastAPI(debug=True)
search_app: Searcher = Searcher.from_local_path(MODEL_PATH)
db = search_app.db


@app.get("/users/")
def get_users() -> list[User]:
    users = []
    for user in db.user.find():
        del user["_id"]
        users.append(user)
    return users


@app.get("/facilities/")
def get_facilities() -> list[Facility]:
    facilities = []
    for facility in db.facility.find():
        del facility["_id"]
        facilities.append(facility)
    return facilities


@app.get("/rec")
def get_recs(user: User) -> list[Facility]:
    res = search_app.search_facilities_from_user(user, 5)
    return res

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from path import Path

from recommender.inference import Searcher

from .model import Facility, User
from .realtime_database import LocalRealTimeDB

MODEL_PATH = Path("output_index")
ARTIFACT_PATH = Path("./data/")


app = FastAPI(debug=True)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


real_db = LocalRealTimeDB("./data/facilityCapacities_sample.json")

search_app: Searcher = Searcher.from_local_path(MODEL_PATH, ARTIFACT_PATH)
search_app.set_realtime_db(real_db)
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
    return search_app.get_all_facilities()


@app.get("/rec")
def get_recs(user: User) -> list[Facility]:
    res = search_app.search_facilities_from_user(user, 5)
    return res

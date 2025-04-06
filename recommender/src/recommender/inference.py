"""
Conduct the search on database

TODO:

1. Rerank using location distance.
2. Facility to region.
3. Use region to filter weather.

"""

import json
from pathlib import Path
from typing import Dict

import faiss
import joblib
import numpy as np
import pandas as pd
from numpy.typing import NDArray

from .database import DB
from .model import ActivityEnum, AgeRange, Facility, Gym, Swimming, User
from .realtime_database import RealtimeDB

TOP_K = 20
FACILITY_MAPPING = "mappedFacilities.json"


def default_activities():
    return [e.value for e in ActivityEnum]


def str_to_activities(activity_strings):
    res = []
    for act in activity_strings:
        for e in ActivityEnum:
            if act == e.value:
                res.append(e)
                break
        else:
            raise RuntimeError(f"Invalid string: {act}")

    return res


def str_to_age_range(age_range_str):
    for e in AgeRange:
        if age_range_str == e.value:
            return e
    raise RuntimeError(f"Invalid string: {age_range_str}")


def transform(transformer, user: Dict) -> NDArray:
    """
    Convert user info to user vector
    Args:
        user:

    Returns:

    """
    user_df = pd.DataFrame([user])
    user_df = user_df.drop(columns=["_id", "username"], errors="ignore")
    user_df["lat"] = user_df["location"].apply(lambda x: x[0])
    user_df["lng"] = user_df["location"].apply(lambda x: x[1])
    user_df = user_df.drop(columns=["location"])
    # TODO: optimize this
    features = transformer.transform(user_df.transpose().to_dict().values())
    return features


def _is_swimming_facility(name: str) -> bool:
    return "swim" in name.lower()


def _is_gym_facility(name: str) -> bool:
    return "gym" in name.lower()


class Searcher:
    def __init__(
        self,
        facility_mapping,
        indexer,
        id_manager,
        transformer,
    ):
        self.db = DB()
        self.indexer = indexer
        self.id_manager = id_manager
        self.transformer = transformer
        self.real_db = None

        self.facility_mapping = facility_mapping

    def set_realtime_db(self, db: RealtimeDB):
        self.real_db = db

    def update_realtime_data(self, facility: Facility):
        assert self.real_db is not None, "not set realtime db"
        self._update_swimming_realtime_data(facility)
        self._update_gym_realtime_data(facility)

    def _update_swimming_realtime_data(self, facility: Facility):
        swimmings = [
            s for s in self.facility_mapping[facility.name] if _is_swimming_facility(s)
        ]
        facility.swimming.available = any(swimmings)
        if not swimmings:
            return
        facility.swimming.closed = any(
            self.real_db.is_closed(name) for name in swimmings
        )
        facility.swimming.capacity = min(
            self.real_db.get_capacity(name) for name in swimmings
        )

    def _update_gym_realtime_data(self, facility: Facility):
        gyms = [s for s in self.facility_mapping[facility.name] if _is_gym_facility(s)]
        facility.gym.available = any(gyms)
        if not gyms:
            return
        facility.gym.closed = any(self.real_db.is_closed(name) for name in gyms)
        facility.gym.capacity = min(self.real_db.get_capacity(name) for name in gyms)

    def search_user(self, username: str) -> User:
        user = self.db.user.find_one({"username": username})
        if user is None:
            raise RuntimeError(f"Could not find: {username}")
        res = User(
            username=user["username"],
            activities=user["activities"],
            age_range=user["age_range"],
            location=user["location"],
        )
        return res

    def search_facilities_from_user(
        self, user: User, top_k: int = TOP_K
    ) -> list[Facility]:
        # if username exists, then get the original data
        if user.username is not None:
            old_user = self.search_user(user.username)
            user.activities = user.activities or old_user.activities
            user.location = user.location or old_user.location

        user.activities = user.activities or default_activities()
        user_dict = json.loads(user.json())
        return self._search_facilities_from_dict(user_dict, top_k)

    def _search_facilities_from_dict(
        self, user_dict: dict, top_k: int = TOP_K
    ) -> list[Facility]:
        user_vector = transform(self.transformer, user_dict)
        dis, indexes = self.indexer.search(user_vector, top_k)

        candidates = [
            Facility(
                name=res["name"],
                address=res["address"],
                contact=res["contact"],
                age_range=res["age_range"],
                activities=res["activities"],
                coordinates=res["coordinates"],
                location=res["location"],
                swimming=Swimming(available=False),
                gym=Gym(available=False),
            )
            for res in self.db.facility.find(
                {"_id": {"$in": self.id_manager[indexes][0].tolist()}}
            )
        ]
        """
        Post filterings
        """
        for facility in candidates:
            self.update_realtime_data(facility)

        return candidates

    def search_facilities_from_username(
        self, username: str, top_k: int = TOP_K
    ) -> list[Facility]:
        """
        Given a user, return a list of facilities
        """
        user = self.search_user(username)
        user_dict = json.loads(user.json())
        return self._search_facilities_from_dict(user_dict, top_k)

    def get_all_facilities(self):
        facilities = []
        for res in self.db.facility.find():
            del res["_id"]
            facilities.append(
                Facility(
                    name=res["name"],
                    address=res["address"],
                    contact=res["contact"],
                    age_range=res["age_range"],
                    activities=res["activities"],
                    coordinates=res["coordinates"],
                    location=res["location"],
                    swimming=Swimming(available=False),
                    gym=Gym(available=False),
                )
            )
        # rerank based on the location
        for facility in facilities:
            self.update_realtime_data(facility)

        # update with filter by weather data.
        return facilities

    @classmethod
    def from_local_path(clz, index_folder: Path, artifact_dir: Path):
        indexer_path = index_folder / "index.bin"
        id_manager_path = index_folder / "ids.npy"
        transformer_path = index_folder / "transformer.joblib"

        indexer = faiss.read_index(str(indexer_path))
        id_manager = np.load(id_manager_path, allow_pickle=True)
        transformer = joblib.load(transformer_path)
        mapped_json = artifact_dir / FACILITY_MAPPING
        facility_mapping = json.load(open(mapped_json))

        return clz(facility_mapping, indexer, id_manager, transformer)

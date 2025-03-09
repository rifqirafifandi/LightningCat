"""
Conduct the search on database
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
from .model import Activity, ActivityEnum, Facility, User, AgeRange, Location

TOP_K = 20


def default_activities():
    return Activity([e.value for e in ActivityEnum])


def str_to_activities(activity_strings):
    res = []
    for act in activity_strings:
        for e in ActivityEnum:
            if act == e.value:
                res.append(e)
                break
        else:
            raise RuntimeError(f"Invalid string: {act}")

    return Activity(res)


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


class Searcher:
    def __init__(self, indexer, id_manager, transformer):
        self.db = DB()
        self.indexer = indexer
        self.id_manager = id_manager
        self.transformer = transformer

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

        results = [
            Facility(
                name=res["name"],
                address=res["address"],
                contact=res["contact"],
                age_range=[str_to_age_range(a) for a in res["age_range"]],
                activities=str_to_activities(res["activities"]),
                coordinates=[Location([c[0], c[1]]) for c in res["coordinates"]],
                location=Location([res["location"][0], res["location"][1]]),
            )
            for res in self.db.facility.find(
                {"_id": {"$in": self.id_manager[indexes][0].tolist()}}
            )
        ]
        return results

    def search_facilities_from_username(
        self, username: str, top_k: int = TOP_K
    ) -> list[Facility]:
        """
        Given a user, return a list of facilities
        """
        user = self.search_user(username)
        user_dict = json.loads(user.json())
        return self._search_facilities_from_dict(user_dict, top_k)

    @classmethod
    def from_local_path(clz, index_folder: Path):
        indexer_path = index_folder / "index.bin"
        id_manager_path = index_folder / "ids.npy"
        transformer_path = index_folder / "transformer.joblib"

        indexer = faiss.read_index(str(indexer_path))
        id_manager = np.load(id_manager_path, allow_pickle=True)
        transformer = joblib.load(transformer_path)

        return clz(indexer, id_manager, transformer)

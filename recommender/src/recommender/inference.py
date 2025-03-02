"""
Conduct the search on database
"""

from numpy.typing import NDArray
import pandas as pd
import joblib
import numpy as np
import faiss
from pathlib import Path
from typing import Dict, List
from .database import DB

TOP_K = 20


def transform(transformer, user: Dict) -> NDArray:
    """
    Convert user info to user vector
    Args:
        user:

    Returns:

    """
    user_df = pd.DataFrame([user])
    user_df = user_df.drop(columns=["_id", "username"])
    user_df["lat"] = user_df["location"].apply(lambda x: x[0])
    user_df["lng"] = user_df["location"].apply(lambda x: x[1])
    user_df = user_df.drop(columns=["location"])
    # TODO: optimize this
    features = transformer.transform(user_df.transpose().to_dict().values())
    breakpoint()
    return features


class Searcher:
    def __init__(self, indexer, id_manager, transformer):
        self.db = DB()
        self.indexer = indexer
        self.id_manager = id_manager
        self.transformer = transformer

    def search_user(self, username: str):
        user = self.db.user.find_one({"username": username})
        if user is None:
            raise RuntimeError(f"Could not find: {username}")
        return user

    def search_facilities_from_user(
        self, username: str, top_k: int = TOP_K
    ) -> List[Dict]:
        """
        Given a user, return a list of facilities
        """
        user = self.search_user(username)
        user_vector = transform(self.transformer, user)
        _, indexes = self.indexer.search(user_vector, top_k)

        results = [
            res
            for res in self.db.facility.find(
                {"_id": {"$in": self.id_manager[indexes][0].tolist()}}
            )
        ]
        return results

    @classmethod
    def from_local_path(clz, index_folder: Path):
        indexer_path = index_folder / "index.bin"
        id_manager_path = index_folder / "ids.npy"
        transformer_path = index_folder / "transformer.joblib"

        indexer = faiss.read_index(str(indexer_path))
        id_manager = np.load(id_manager_path, allow_pickle=True)
        transformer = joblib.load(transformer_path)

        return clz(indexer, id_manager, transformer)

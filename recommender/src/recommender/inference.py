"""
Conduct the search on database
"""

from numpy.typing import NDArray
import numpy as np
import faiss
from pathlib import Path
from typing import Dict
from .database import DB

def transform():
    ...


def transform(user: Dict) -> NDArray:
    """
    Convert user info to user vector
    Args:
        user:

    Returns:

    """
    ...


class Searcher:
    def __init__(self, indexer, id_manager):
        self.db = DB()
        self.indexer = indexer
        self.id_manager = id_manager

    def search(self, username: str):
        user = self.db.user.find_one({"username": username})
        if user is None:
            raise RuntimeError(f"Could not find: {username}")

    @classmethod
    def from_local_path(clz, index_folder: Path):
        indexer_path = index_folder / "index.bin"
        id_manager = index_folder / "ids.npy"

        indexer = faiss.read_index(str(indexer_path))
        id_manager = np.load(id_manager, allow_pickle=True)

        return clz(indexer, id_manager)

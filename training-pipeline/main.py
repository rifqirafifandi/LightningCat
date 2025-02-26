import numpy as np
from numpy.typing import NDArray
import pandas as pd
from loguru import logger
from training_pipeline import database
from sklearn.feature_extraction import DictVectorizer
import faiss
from pathlib import Path


def collect_facilities():
    db = database.DB()
    facilities = list(db.facility.find({}))
    df = pd.DataFrame(facilities)
    ids = df["_id"].values
    df = df.drop(columns=["_id", "name", "address", "contact", "time", "coordinates"])
    return df, ids


def transform(df: pd.DataFrame) -> NDArray:
    """
    transform the original dataframe to vectors

    1. 1-hot encoding for enum
    2. convert coordinates
    """
    df["lat"] = df["location"].apply(lambda x: x[0])
    df["lng"] = df["location"].apply(lambda x: x[1])
    df = df.drop(columns=["location"])
    transformer = DictVectorizer(sparse=False)
    features = transformer.fit_transform(df.transpose().to_dict().values())
    return features


def index(features: NDArray):
    d = features.shape[1]
    index = faiss.IndexFlatL2(d)
    index.add(features)
    index.train(features)
    return index


def save(output_dir, indexer, ids):
    index_path = output_dir / "index.bin"
    ids_path = output_dir / "ids.npy"

    faiss.write_index(indexer, str(index_path))
    np.save(ids_path, ids)


def main():
    """
    Trigger the training
    """
    logger.info("Trigger training -- build vector database")
    # data engineering
    logger.info("Collect data from db")
    df, ids = collect_facilities()

    # setup vector database
    logger.info("Feature engineering")
    features = transform(df)
    logger.info("Vector indexing")
    indexer = index(features)
    assert indexer.is_trained
    logger.info(f"Total indexed points: {indexer.ntotal}")
    output_path = Path("output_index/")
    output_path.mkdir(parents=True, exist_ok=True)
    save(output_path, indexer, ids)
    logger.info("Saved index")


if __name__ == "__main__":
    main()

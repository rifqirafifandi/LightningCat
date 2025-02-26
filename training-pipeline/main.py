import numpy as np
from numpy.typing import NDArray
import pandas as pd
from loguru import logger
from training_pipeline import database


def collect_facilities():
    db = database.DB()
    facilities = list(db.facility.find({}))
    df = pd.DataFrame(facilities)
    df = df.drop(columns=["_id", "name", "address", "contact", "time", "coordinates"])


def transform(df: pd.DataFrame) -> NDArray:
    """
    transform the original dataframe to vectors

    1. 1-hot encoding for enum
    2. convert coordinates
    """
    ...


def main():
    """
    Trigger the training
    """
    logger.info("Trigger training -- build vector database")
    df = collect_facilities()
    data = transform(df)


if __name__ == "__main__":
    main()

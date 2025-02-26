import pandas as pd
from loguru import logger
from training_pipeline import database


def collect_facilities():
    db = database.DB()
    facilities = list(db.facility.find({}))
    breakpoint()


def main():
    """
    Trigger the training
    """
    logger.info("Trigger training -- build vector database")
    collect_facilities()


if __name__ == "__main__":
    main()

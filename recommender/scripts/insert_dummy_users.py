"""
Insert facilities data to mongodb
"""

import typer
import json
from recommender import database
from pathlib import Path


def main(
    input_path: Path = typer.Argument(
        ...,
        file_okay=True,
        exists=True,
        readable=True,
        help="Path to user dummy data",
    ),
):
    with open(input_path, "r") as f:
        data = json.load(f)

    db = database.DB()
    db.user.insert_many(data)
    print("Done !!")


if __name__ == "__main__":
    typer.run(main)

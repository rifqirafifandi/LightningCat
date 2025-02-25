"""
Insert facilities data to mongodb
"""
import typer
import json
from recommender import database
from pathlib import Path

def main(
    input_path: Path = typer.Argument(..., file_okay=True, exists=True, readable=True, help="Path to  SportSG Sport Facilities geojson file")
):
    with open(input_path, "r") as f:
        data = json.load(f)

    db = database.DB()
    db.facility.insert_many(data)
    print("Done !!")


if __name__ == "__main__":
    typer.run(main)

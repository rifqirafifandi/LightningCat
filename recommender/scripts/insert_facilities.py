"""
Insert facilities data to mongodb
"""
import typer
from recommender import database
from pathlib import Path

def main(
    input_path: Path = typer.Argument(..., file_okay=True, exists=True, readable=True, help="Path to  SportSG Sport Facilities geojson file")
):
    ...


if __name__ == "__main__":
    typer.run(main)

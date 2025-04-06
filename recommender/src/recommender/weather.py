import json

import boto3
from dotenv import load_dotenv

WEATHER_VALUES = [
    "Fair",
    "Fair (Day)",
    "Fair (Night)",
    "Fair and Warm",
    "Partly Cloudy",
    "Partly Cloudy (Day)",
    "Partly Cloudy (Night)",
    "Cloudy",
    "Hazy",
    "Slightly Hazy",
    "Windy",
    "Mist",
    "Fog",
    "Light Rain",
    "Moderate Rain",
    "Heavy Rain",
    "Passing Showers",
    "Light Showers",
    "Showers",
    "Heavy Showers",
    "Thundery Showers",
    "Heavy Thundery Showers",
    "Heavy Thundery Showers with Gusty Winds",
]


class Weather:
    def __init__(self):
        load_dotenv(dotenv_path=".env_local")
        self.s3 = boto3.client("s3", region_name="ap-southeast-1")

    def filter(self, candidates):
        # super slow, but ...
        response = self.s3.get_object(
            Bucket="cc5224-bucket1", Key="apidata/weather2h.json"
        )
        data = json.loads(response["Body"].read())
        # simply return result with no showers

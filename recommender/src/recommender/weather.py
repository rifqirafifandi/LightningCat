import json

import boto3
from dotenv import load_dotenv

from .model import Facility
from .utils import haversine_distance

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

BAD_WEATHER_VALUES = [
    "Hazy",
    "Moderate Rain",
    "Heavy Rain",
    "Showers",
    "Heavy Showers",
    "Thundery Showers",
    "Heavy Thundery Showers",
    "Heavy Thundery Showers with Gusty Winds",
]

ALTER_ACTIVITIES = [
    "Gym",
    "Table_tennis",
    "Indoor",
]


class Weather:
    def __init__(self):
        load_dotenv(dotenv_path=".env_local")
        self.s3 = boto3.client("s3", region_name="ap-southeast-1")
        self.area = None
        self.area_weather = None

    def _read_data(self):
        response = self.s3.get_object(
            Bucket="cc5224-bucket1", Key="apidata/weather2h.json"
        )
        data = json.loads(response["Body"].read())["data"]
        self.area = []
        for item in data["area_metadata"]:
            name = item["name"]
            location = [
                item["label_location"]["latitude"],
                item["label_location"]["longitude"],
            ]
            self.area.append((name, location))
        # weather data
        self.area_weather = {}
        for item in data["items"][0]["forecasts"]:
            self.area_weather[item["area"]] = item["forecast"]

    def update_weather_status(self, cand: Facility):
        cand_lat = cand.location[0]
        cand_lon = cand.location[1]
        area = min(
            self.area,
            key=lambda x: haversine_distance(x[1][0], x[1][1], cand_lat, cand_lon),
        )
        area_name = area[0]
        cand.weather = self.area_weather[area_name]
        return cand

    def filter(self, candidates):
        self.area = None
        self.area_weather = None
        self._read_data()
        assert self.area is not None
        assert self.area_weather is not None
        filtered_candidates = []
        for cand in candidates:
            new_cand = self.update_weather_status(cand)
            if new_cand.weather in BAD_WEATHER_VALUES:
                new_cand.alternatives = ALTER_ACTIVITIES
            filtered_candidates.append(new_cand)
        return filtered_candidates

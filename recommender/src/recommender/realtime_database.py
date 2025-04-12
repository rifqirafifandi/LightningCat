"""
Interface with Realtime Database
TODO: update data after 30 mins
"""

import json
import boto3
from dotenv import load_dotenv
from abc import ABC, abstractmethod

from path import Path


class RealtimeDB(ABC):
    @abstractmethod
    def is_closed(self, facility_name: str) -> bool | None:
        """
        Check if the facility is closed
        """
        ...

    @abstractmethod
    def get_capacity(self, facility_name: str) -> float | None:
        """
        Return the current facility.
        Note: can be empty
        """
        ...


class LocalRealTimeDB(RealtimeDB):
    def __init__(self, capacity_path: Path):
        # get all cap info
        load_dotenv(dotenv_path=".env_local")
        self.s3 = boto3.client("s3", region_name="ap-southeast-1")
        self._refresh()

    def _refresh(self):
        response = self.s3.get_object(
            Bucket="cc5224-bucket1", Key="apidata/facilityCapacity30min.json"
        )
        json_data = json.loads(response["Body"].read())
        json_data = json_data["result"]["data"]["json"]
        self.facilities = {}
        for item in json_data["swimFacilities"]:
            self.facilities[item["name"]] = item
        for item in json_data["gymFacilities"]:
            self.facilities[item["name"]] = item

    def is_closed(self, facility_name: str) -> bool | None:
        item = self.facilities.get(facility_name, None)
        if item is None:
            return None
        return item["isClosed"]

    def get_capacity(self, facility_name: str) -> float | None:
        item = self.facilities.get(facility_name, None)
        if item is None:
            return None
        return item["capacityInfo"]

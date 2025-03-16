"""
Interface with Realtime Database
"""

import json
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
        json_data = json.load(open(capacity_path))
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

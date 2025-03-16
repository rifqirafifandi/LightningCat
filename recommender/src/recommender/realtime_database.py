"""
Interface with Realtime Database
"""

from abc import ABC, abstractmethod


class RealtimeDB(ABC):
    @abstractmethod
    def is_closed(facility_name: str) -> bool:
        """
        Check if the facility is closed
        """
        ...

from math import asin, cos, radians, sqrt


def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two points
    on the Earth (specified in decimal degrees).

    Args:
        lat1, lon1: Latitude and longitude of point 1 (in degrees)
        lat2, lon2: Latitude and longitude of point 2 (in degrees)

    Returns:
        Distance between the two points in kilometers
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = 0.5 * (1 - cos(dlat) + cos(lat1) * cos(lat2) * (1 - cos(dlon)))
    c = 2 * asin(sqrt(a))

    # Radius of Earth in kilometers (mean radius = 6371 km)
    r = 6371.0
    return c * r

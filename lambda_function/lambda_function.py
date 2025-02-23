import redis
import ssl
import os
import json
import logging
import requests

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Redis connection setup (TLS-enabled)
redis_host = os.environ['REDIS_HOST']
ssl_context = ssl.create_default_context()

redis_client = redis.StrictRedis(
    host=redis_host,
    port=6379,
    ssl=True,
    ssl_cert_reqs=None,  # Set to 'required' if CA cert is included
    decode_responses=True
)

def fetch_and_cache(api_url, cache_key, expiration=300):
    """
    Fetches data from an API and stores it in Redis with a TTL.
    """
    try:
        logger.info(f"🌐 Fetching data from API: {api_url}")
        response = requests.get(api_url, timeout=10)
        response.raise_for_status()
        data = response.json()

        # Store data in Redis with expiration
        redis_client.set(cache_key, json.dumps(data), ex=expiration)
        logger.info(f"✅ Data cached in Redis under key: {cache_key} with TTL: {expiration}s.")
        return {"status": "success", "data": data}

    except Exception as e:
        logger.error(f"❌ Failed to fetch/cache API data: {e}")
        return {"status": "error", "message": str(e)}

def lambda_handler(event, context):
    """
    Lambda entry point: Expects 'api_url' and 'cache_key' in the event.
    """
    api_url = event.get("api_url")
    cache_key = event.get("cache_key")

    # Input validation
    if not api_url or not cache_key:
        logger.error("❌ Missing parameters: 'api_url' or 'cache_key'.")
        return {"statusCode": 400, "body": json.dumps({"error": "Missing parameters"})}

    # Fetch from API and cache in Redis
    result = fetch_and_cache(api_url, cache_key)
    return {"statusCode": 200, "body": json.dumps(result)}
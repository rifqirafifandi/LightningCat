import os
import json
import logging
import requests
import boto3

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Create an S3 client
s3_client = boto3.client('s3')
s3_bucket = os.environ['S3_BUCKET']  # Make sure this environment variable is set

def fetch_and_store(api_url, s3_key):
    """
    Fetch data from an API and store it in S3.
    """
    try:
        logger.info(f"Fetching data from API: {api_url}")
        response = requests.get(api_url, timeout=10)
        response.raise_for_status()
        data = response.json()

        # Convert the data to a JSON string
        data_string = json.dumps(data)

        # Write data to S3
        logger.info(f"Writing fetched data to S3: Bucket={s3_bucket}, Key={s3_key}")
        s3_client.put_object(
            Bucket=s3_bucket,
            Key=s3_key,
            Body=data_string
        )
        
        logger.info(f"Data stored in S3 under key: {s3_key}.")
        return {"status": "success", "data": data}
    
    except Exception as e:
        logger.error(f"Failed to fetch/store API data: {e}")
        return {"status": "error", "message": str(e)}

def lambda_handler(event, context):
    """
    Lambda entry point: Expects 'api_url' and 's3_key' in the event.
    """
    api_url = event.get("api_url")
    s3_key = event.get("s3_key")  # Instead of cache_key, we now use s3_key for the object name

    # Input validation
    if not api_url or not s3_key:
        logger.error("Missing parameters: 'api_url' or 's3_key'.")
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing parameters"})
        }

    # Fetch from API and store in S3
    result = fetch_and_store(api_url, s3_key)
    return {
        "statusCode": 200,
        "body": json.dumps(result)
    }
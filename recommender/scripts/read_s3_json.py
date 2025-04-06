import json
import boto3
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env_local")

s3 = boto3.client('s3', region_name='ap-southeast-1')

response = s3.get_object(Bucket='cc5224-bucket1', Key='apidata/weather2h.json')
data = json.loads(response['Body'].read())
print(json.dumps(data))  # Access JSON fields

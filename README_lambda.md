# Installing Lambda function on AWS 

As our lambda function imports several libraries, you must first install these dependencies locally and zip them for upload before the function can be used on AWS. 

We have two options for lambda functions. The first is for redis deployment and the second is for S3 deployment. 

The rest of this guide is for the S3 deployment. 

1. Install dependencies locally 
From the folder where the lambda function is saved, assuming the folder is my_lambda. Install requests and its dependencies into the current folder, creating subfolders like requests/ and possibly urllib3/, etc. 

cd my_lambda
pip install requests -t .

2. Zip folder
Once installed, zip with these commands. The zip file will include the pfunction and all dependencies required. 
cd my_lambda
zip -r ../my_lambda_deployment.zip .

3. Deploy on AWS 
Go to your Lambda function in the AWS console.
Under “Code,” choose “Upload from” → “.zip file.”
Upload my_lambda_deployment.zip.

4. Set ENV variables for S3 bucket name and S3 bucket path 
e.g. S3_BUCKET= cc5224-bucket1

5. Set test event with api url and api key
e.g. 
{
  "api_url": "https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast",
  "s3_key": "apidata/weather2h.json"
} 

6. Test function and deploy 
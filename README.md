# LightningCat

Contents of our repo:
1. frontend - code for frontend in react (Installation instructions below)
2. api-sever - code for api-server
3. dataAndDataCleanup - data files 
4. lambda_function_s3 and lambda_function_capacities - lambda functions to poll government APIs (Installation instructions below)  

## Data files
- contains various data samples, raw datasets, their associated data processing scripts and the post processed output utilised in our webapp. 

The town boundaries and polygons were taken from data.gov.sg 
https://data.gov.sg/collections/2104/view

SportSG facilities and polygons were taken from data.gov.sg
https://data.gov.sg/datasets/d_9b87bab59d036a60fad2a91530e10773/view

2 hour weather forecast data from data.gov.sg
https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast

lightning data from data.gov.sg
https://api-open.data.gov.sg/v2/real-time/api/weather?api=lightning

Facility Capacities are taken from activesg
https://activesg.gov.sg/api/trpc/pass.getFacilityCapacities 


## Installing frontend onto ec2 
Frontend is installed into its own EC2 server in AWS 

1. spin up a new ec2 instance with amazon linux. Create key and save. Allow ssh into the instance. 
2. ssh into instance
```
ssh -i frontend-server-key.pem ec2-user@<instance-public-ip>
```
4. update packages in ec2 server
```
sudo dnf update -y
sudo dnf install -y gcc-c++ make
```
4. install node.js
```
sudo dnf module list nodejs # Check available versions
sudo dnf module enable nodejs:20 # Enable Node.js v20
sudo dnf install -y nodejs
node -v # Verify install
npm -v # Verify install
```
5. Copy Frontend Repository
```
scp -i <your-key.pem> -r ./frontend-folder ec2-user@<instance-public-ip>:/home/ec2-user/
```
6. Install and Build Frontend
```
cd frontend
npm install
npm run build
```
7. Serve Production Build
```
sudo npm install -g serve
sudo serve -s build -l 80 # Serve on port 80
```
8. OR Use PM2 for persistence (alternative to 7)
```
sudo npm install -g pm2
sudo pm2 serve build 80 --name frontend --spa  # Configure PM2 to serve the build
sudo pm2 startup # Setup PM2 to start automatically on system boot
sudo pm2 save # Save the current PM2 configuration
```
9. Verify Installation
Access the frontend by visiting the EC2 instance's public IP address in a web browser.



## Installing Lambda function on AWS 

There are two lambda functions to deploy. One for the weather government APIs and one for the facility capacities API. Note that the libraries and code needed for both are different. Hence, they must be setup seperately on AWS. The steps to follow for both are the same and are as follows.  

As our lambda functions imports several libraries, you must first install these dependencies locally and zip them for upload before the function can be used on AWS. 

1. Install dependencies locally 
From the folder where the lambda function is saved, assuming the folder is my_lambda. Install requests and its dependencies into the current folder, creating subfolders like requests/ and possibly urllib3/, etc. 

    ```
    cd my_lambda
    pip install requests -t .
    ```

2. Zip folder
Once installed, zip with these commands. The zip file will include the pfunction and all dependencies required. 
    ```
    cd my_lambda
    zip -r ../my_lambda_deployment.zip .
    ```

3. Deploy on AWS 
Go to your Lambda function in the AWS console.
Under “Code,” choose “Upload from” → “.zip file.”
Upload my_lambda_deployment.zip.

4. Set ENV variables for S3 bucket name and S3 bucket path 
```e.g. S3_BUCKET= cc5224-bucket1```

5. Set test event with api url and api key
e.g. 
    ```
    {
      "api_url": "https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast",
      "s3_key": "apidata/weather2h.json"
    } 
    ```

6. Test function and deploy 

### All other configurations needed for APIs used in event schedular/ lambda test variables

1. 2h weather data
```
{
  "api_url": "https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast",
  "s3_key": "apidata/weather2h.json"
} 
```
2. 24h weather data
```
{
  "api_url": "https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast",
  "s3_key": "apidata/weather24h.json"
} 
```
3. 4d weather data 
```
{
  "api_url": "https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook",
  "s3_key": "apidata/weather4d.json"
} 
```
4. lightning data 
```
{
  "api_url": "https://api-open.data.gov.sg/v2/real-time/api/weather?api=lightning",
  "s3_key": "apidata/lightning_current.json"
}
```

5. facilities data
```
{
  "api_url": "https://activesg.gov.sg/api/trpc/pass.getFacilityCapacities",
  "s3_key": "apidata/capacity_api_30min.json"
}
```

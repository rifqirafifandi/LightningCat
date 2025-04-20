# LightningCat

Lightning Cat is a cloud-based platform solving the common frustrations Singapore residents face when accessing public sporting facilities. By providing real-time information on facility status, weather conditions, and availability in one intuitive interface, we help users avoid the disappointment of unexpected closures and navigate the challenging booking process. Our dynamic map showcases all sporting venues across Singapore with up-to-date operational information, while also connecting users with potential activity partners to reduce underutilized bookings. Lightning Cat supports Singapore's vision for an active population by making sports participation more accessible, efficient, and enjoyable for everyone.

Visit us at: https://web.chucklenuts.party/

Contents of our repo:
1. api-sever - code for api-server [api-server/README.md](api-server/README.md)
2. architectureDiagram - drawio and png versions of our architecture diagram
3. dataAndDataCleanup - various data files used 
4. frontend - code for frontend in react (Installation instructions below) [frontend/README.md](frontend/README.md)
5. lambdaFunctions - lambda functions to poll government APIs (Installation instructions below)
6. recommender - code for the recommender service.
7. training-pipeline - code for ML features/models preperation.

## dataAndDataCleanup - various data files used 
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

## frontend - code for frontend in react
The frontend is developed using React.JS framework. The frontend directory consists of two subfolders, *public* and *src*. *Public* subfolder contains the files and the assets that will be delivered to the users when they enter the website from the browser, such as HTML file, image files, and compiled webpage script. *Src* subfolder contains the main frontend scripts that is used for developing the frontend. These scripts will be compiled and placed to the *public* subfolder. 

In the main frontend directory itself there are environment files (used for map library tokens) and *package.json* file listing the dependencies required to run the frontend.

### src Subfolder
The *src* subfolder contains all the code that we developed for the frontend. There are further subfolders inside *src*, shown below with a brief description of each subfolder.
- assets: images files for the webpage
- components: scripts for webpage components such as navigation bar, search box, etc.
- contexts: scripts for handling use cases such as login (authentication) and notifications
- pages: scripts for routed webpages such as account details, booking history, wallet, etc.
- queries: Function calls to the api-server
- types: Enumeration of activity types and facility names

In the main *src* subfolder, there are files to define the routing logic of the webpage (*routes.js*) and the entry point file for the webpage (*App.jsx*). 

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

# Starting Recommendation Service. 

0. Update AWS's DocumentDB credentials in `.env_local` if necessary.
1. Install necessary dependencies on EC2:

```bash
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user
```

2. Cd to the recommendation codebase:

```bash
make docker-build
make docker-serve
```

# Running Training-Pipeline service

0. Update AWS's DocumentDB credentials in `.env_local` if necessary.
1. Insert dependencies:
    a. Insert [uv](https://docs.astral.sh/uv/getting-started/installation/)
    b. Setup Python environment

```bash
uv venv
uv sync
```

2. Insert data to DocumentDB.
```bash
python scripts/insert_facilities.py ../dataAndDataCleanup/facility_data.json
```
3. Model Training:
```bash
python main.py
```

`output_index` then can be used in `recommender` by directly copy to `recommender` codebase.

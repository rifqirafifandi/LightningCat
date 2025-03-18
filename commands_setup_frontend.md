steps to set up front end server 
1. create ec2 instance - amazon linux 
1a. create key and save 
2. ssh into instance 
ssh -i frontend-server-key.pem ec2-user@<PUBLIC-IP> 
3. update packages in ec2 server 
sudo dnf update -y
sudo dnf install -y gcc-c++ make
4. install node.js
sudo dnf module list nodejs   # Check available versions #returns not installed 
sudo dnf module enable nodejs:20  # Example: Enable Node.js v20 #returns not installed 
sudo dnf install -y nodejs
node -v #verify install 
npm -v #verify install 
5. scp front end repo from local to ec2 
scp -i <your-key.pem> -r ./frontend-folder ec2-user@<EC2-PUBLIC-IP>:/home/ec2-user/
scp -i frontend-server-key.pem -r ./frontend ec2-user@18.143.65.211:/home/ec2-user/
6. install frontend 
cd frontend 
npm install
npm run build 
6. install serve to serve the production build 
sudo npm install -g serve 
7. serve on port 80 
sudo serve -s build -l 80 #otherwise non root user cannot bind to privileged ports 
8. check public ip address 
9. use pm2 for persistent serving 
sudo npm install -g pm2
sudo pm2 serve build 80 --name frontend --spa 
sudo pm2 startup
sudo pm2 save
sudo pm2 startup
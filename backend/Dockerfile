FROM python:3.11-slim

#Install Python and pip3
RUN apt update #update packages
RUN apt-get install wget -y # install pip install
RUN apt-get install unzip -y # install pip install
RUN apt-get install python3-pip -y  # install pip install
RUN apt-get update
RUN apt-get install git -y
RUN apt-get install curl  -y

WORKDIR /opt/sonar-scanner

RUN wget "https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-6.2.1.4610-linux-x64.zip"
RUN unzip "sonar-scanner-cli-6.2.1.4610-linux-x64.zip"
RUN rm "sonar-scanner-cli-6.2.1.4610-linux-x64.zip"
# Show all files in the directory
RUN ls -la
RUN cd "./sonar-scanner-6.2.1.4610-linux-x64/conf/"
COPY ./sonar-scanner.properties sonar-scanner.properties
CMD ["./sonar-scanner","-v"]
RUN cd "./sonar-scanner-6.2.1.4610-linux-x64/bin/"

#Add sonar-scanner to PATH
ENV PATH="/opt/sonar-scanner/sonar-scanner-6.2.1.4610-linux-x64/bin:${PATH}"


#Install all requirements
WORKDIR /opt/backend
COPY requirements.txt requirements.txt
COPY extra-sonarqube-properties.txt extra-sonarqube-properties.txt
RUN  pip3 install -r requirements.txt
COPY src/ src/
EXPOSE 4040
CMD ["python3", "./src/app.py"]



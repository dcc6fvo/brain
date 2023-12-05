import time
import requests
import subprocess
import socket
import os
import json
import logging

def checkAdopted():
    
    file = open("check", "w")
    file.write("adopted=true")
    file.close()

def doPost(url,adoption):

    r = requests.post(url, adoption)
    return r

def get_hostname():

    return socket.gethostname()

def get_uuid():
    dmidecode = subprocess.Popen(['dmidecode'],
                                      stdout=subprocess.PIPE,
                                      bufsize=1,
                                      universal_newlines=True
                                      )

    while True:
        line = dmidecode.stdout.readline()
        if "UUID:" in str(line):
            uuid = str(line).split("UUID:", 1)[1].split()[0]
            return uuid
        if not line:
            break

def install_frontpage(name):
    logging.info("Thread %s: starting", name)
    time.sleep(2)
    logging.info("Thread %s: finishing", name)

def start_adoption(dev_uuid, dev_hostname):

    adoption = {}
    adoption["id"] = dev_uuid
    adoption["humanhash"] = dev_uuid[0:8]
    adoption["surname"] = dev_hostname

    print(adoption)

    r = doPost('http://127.0.0.1:8000/api/devices/adoption',adoption)
    response_code = r.status_code
    response_json = json.loads(r.text)

    #adoption created
    if(response_code == 200):
        print(r)
    elif(response_code == 400):
        print(response_code)

    print(response_json.get("message")) 

def main():

    format = "%(asctime)s: %(message)s"
    logging.basicConfig(format=format, level=logging.INFO,datefmt="%H:%M:%S")

    dev_uuid = get_uuid()
    dev_hostname = get_hostname()
    start_adoption(dev_uuid, dev_hostname)

if __name__ == "__main__":
    main()

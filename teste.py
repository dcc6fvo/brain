import time
import requests
import subprocess
import socket
import os
import json
import logging

def doPost(url,adoption):

    r = requests.post(url, adoption)
    return r

def doGet(url):

    r = requests.get(url)
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

def apt_update():
    logging.info("Thread: starting")
    try:
        #subprocess.check_call(['apt-get', 'update'], stdout=open(os.devnull,'wb'))
        logging.info(subprocess.check_output(["apt-get", "update"]))
    except subprocess.CalledProcessError as e:
        logging.error(e.output)
    logging.info("Thread: finishing")

def start_adoption(adoption):

    while True:
        r = doPost('http://127.0.0.1:8000/api/devices/adoption',adoption)
        response_code = r.status_code
        response_json = json.loads(r.text)
        if(response_json.get("message") ==  'Device already adopted' ):
            break
        logging.info(response_json.get("message"))    
        time.sleep(5)

def running_task(tasks):
       
    for x in tasks:
        command = x["command"].split()
        logging.info("Task " +str(x["id"])+ " starting")
        try:
            logging.info(subprocess.check_output(command))
            confirm = {}
            confirm["id"] = x["id"]
            doPost('http://127.0.0.1:8000/api/devices/tasks/confirm/',confirm)
            logging.info("Task " +str(x["id"])+ " finished")

        except subprocess.CalledProcessError as cpe:
            logging.error(cpe.output)
        except Exception as e:
            logging.error(e.output)
    

def taking_tasks(adoption):

    while True:
        logging.info('taking tasks')    
        time.sleep(5)

        r = doGet('http://127.0.0.1:8000/api/devices/tasks/'+ adoption["id"])
        response_code = r.status_code
        response_json = json.loads(r.text)
        try:
            running_task(response_json.get("tasks"))
        except Exception as e:
            logging.error(e.output)


def main():

    format = "%(asctime)s: %(message)s"
    logging.basicConfig(format=format, level=logging.INFO,datefmt="%H:%M:%S")

    adoption = {}
    adoption["id"] = get_uuid()
    adoption["humanhash"] = get_uuid()[0:8]
    adoption["surname"] = get_hostname()

    start_adoption(adoption)
    taking_tasks(adoption)



if __name__ == "__main__":
    main()

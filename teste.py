import time
import requests
import subprocess
import socket
import os
import json
import logging

server_host_address="192.168.1.31"
server_host_protocol="http"
server_host_port="8000"
client_local_www='/var/www/html'

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
    logging.info("Running apt-get update..")
    try:
        #subprocess.check_call(['apt-get', 'update'], stdout=open(os.devnull,'wb'))
        logging.info(subprocess.check_output(["apt-get", "update"]))
    except subprocess.CalledProcessError as e:
        logging.error(e.output)

def apt_install_apache_and_php():
    logging.info("Installing apache and php requirements")
    try:
        logging.info(subprocess.check_output(["apt-get", "install", "apache2", "php", "libapache2-mod-php", "-y"]))
    except subprocess.CalledProcessError as e:
        logging.error(e.output)

def composer_install():
    logging.info("Installing composer")
    try:
        logging.info(subprocess.check_output(["./utils/composer-install.sh"]))
        logging.info(subprocess.check_output(["mv","composer.phar", "/usr/local/bin/composer"]))
    except subprocess.CalledProcessError as e:
        logging.error(e.output)

def adoption_page_install():
    logging.info("Configuring adoption page")
    try:
        logging.info(subprocess.check_output(["composer", "require", "chillerlan/php-qrcode"],cwd=client_local_www))
    except subprocess.CalledProcessError as e:
        logging.error(e.output)

def install_basic_requirements():
    logging.info("Installing basic requirements")
    apt_update()
    apt_install_apache_and_php()
    composer_install()
    adoption_page_install()

def start_adoption(adoption):
   
    while True:
        r = doPost(server_host_protocol+'://'+server_host_address+':'+server_host_port+'/api/devices/adoption',adoption)
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
            doPost(server_host_protocol+'://'+server_host_address+':'+server_host_port+'/api/devices/tasks/confirm/',confirm)
            logging.info("Task " +str(x["id"])+ " finished")

        except subprocess.CalledProcessError as cpe:
            logging.error(cpe.output)
        except Exception as e:
            logging.error(e.output)
    
def taking_tasks(adoption):

    while True:
        logging.info('taking tasks')    
        time.sleep(5)

        r = doGet(server_host_protocol+'://'+server_host_address+':'+server_host_port+'/api/devices/tasks/'+ adoption["id"])
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

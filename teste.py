import paramiko
import time

def doTask(client,command,message):

    stdin, stdout, stderr = client.exec_command(command)

    for line in stdout:
        print(line.strip('\n'))

    print(message)


def main():

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('192.168.1.193', username='suporte', password='123456')

    doTask(client,'sudo apt-get update -y','Apt get updated.')
    doTask(client,'sudo apt-get install nginx -y','nginx installed.')

    client.close()

if __name__ == "__main__":
    main()

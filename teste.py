import paramiko
import time
import Database as Database
import humanhash

from os import chmod
from Crypto.PublicKey import RSA

def doTask(client,command,message):

    stdin, stdout, stderr = client.exec_command(command)

    for line in stdout:
        print(line.strip('\n'))

    print(message)

def installDependencies(client):

    doTask(client,'sudo apt-get update -y','===> apt get updated <===')    
    doTask(client,'sudo apt-get install unclutter nginx imagemagick chromium-browser php php-fpm -y','===> various dependencies installed <===')

def generateSSHKeyPair():

    key = RSA.generate(2048)
    with open("/tmp/private.key", 'wb') as content_file:
        chmod("/tmp/private.key", 600)
        content_file.write(key.exportKey('PEM'))
    pubkey = key.publickey()
    with open("/tmp/public.key", 'wb') as content_file:
        content_file.write(pubkey.exportKey('OpenSSH'))

def main():

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect('192.168.1.193', username='suporte', password='123456')

    #generateSSHKeyPair()
    #installDependencies(client)


    #with Database("localhost","brain","123456","brain") as db:

        #db.execute('CREATE TABLE comments(pkey INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR, comment_body VARCHAR, date_posted TIMESTAMP)')
        #db.execute('INSERT INTO comments (username, comment_body, date_posted) VALUES (?, ?, current_date)', ('tom', 'this is a comment'))
    #    comments = db.query('SELECT * FROM comments')
    #    print(comments)

    digest = '7528880a986c40e78c38115e640da2a1'
    hash = humanhash.humanize(digest)
    hashv2 = humanhash.humanize(digest, words=3)
    hashuuid = humanhash.uuid()

    print(hash)
    print(hashv2)
    print(hashuuid)

    client.close()

if __name__ == "__main__":
    main()

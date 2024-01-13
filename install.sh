#!/bin/bash

is_shell_installed(){

    $1 >/dev/null 2>&1

    if [ "$?" -eq 127 ]; then
        retval=0
    else
        retval=1
    fi

    echo $retval
}

is_apt_installed(){

    if [ "$(dpkg -l | awk '/'$1'/ {print }'|wc -l)" -ge 1 ]; then
        retval=1
    else
        retval=0
    fi

    echo $retval
}

composer_install(){

    EXPECTED_CHECKSUM="$(php -r 'copy("https://composer.github.io/installer.sig", "php://stdout");')"
    php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
    ACTUAL_CHECKSUM="$(php -r "echo hash_file('sha384', 'composer-setup.php');")"

    if [ "$EXPECTED_CHECKSUM" != "$ACTUAL_CHECKSUM" ]
    then
        >&2 echo 'ERROR: Invalid installer checksum'
        rm composer-setup.php
        exit 1
    fi

    php composer-setup.php
    RESULT=$?
    rm composer-setup.php
    return $RESULT
}

basic_software_install(){

    isnginx=$(is_apt_installed "nginx")
    isphp=$(is_apt_installed "php")
    isphpfpm=$(is_apt_installed "php-fpm")
    iscomposer=$(is_shell_installed "composer")

    if [ $isnginx -eq 0 ]; then
        apt-get install nginx -y
    fi

    if [ $isphp -eq 0 ]; then
        apt-get install php-cgi -y
        apt-get install php -y
    fi

    if [ $isphpfpm -eq 0 ]; then
        apt-get install php-fpm -y
    fi

    if [ $iscomposer -eq 0 ]; then
        composer_install
        mv composer.phar /usr/local/bin/composer
    fi

    if [ ! -d "$client_local_www/vendor/chillerlan" ]; then

        isphpgd=$(is_apt_installed "php-gd")
        isphpimagick=$(is_apt_installed "php-imagick")
        isphpmbstring=$(is_apt_installed "php-mbstring")
        
        if [ $isphpgd -eq 0 ]; then
            apt-get install php-gd -y
        fi

        if [ $isphpimagick -eq 0 ]; then
            apt-get install php-imagick -y
        fi

        if [ $isphpmbstring -eq 0 ]; then
            apt-get install php-mbstring -y
        fi

        cd $client_local_www
        composer require chillerlan/php-qrcode --no-interaction
    fi
}

configuring_index_adoption_page(){

    if [ ! -d "$client_local_www/styles" ]; then
        cp -r $local_base_dir/adoption/styles $client_local_www/styles
    fi
    
    if [ ! -f "$client_local_www/index.php" ]; then
        cp $local_base_dir/adoption/index.php $client_local_www/index.php
    fi

    if [ -f "$client_local_www/index.html" ]; then
        rm $client_local_www/index.html
    fi

    if [ -f "$client_local_www/index.nginx-debian.html"]; then
        rm $client_local_www/index.nginx-debian.html
    fi
}

configuring_nginx(){

    local_php_version=$(php -v | head -n 1 | cut -d " " -f 2 | cut -f1-2 -d".")
    cp $local_base_dir/nginx/default /etc/nginx/sites-available/default
    sed -i "s/###/$local_php_version/" /etc/nginx/sites-available/default
    systemctl reload nginx
}

configuring_kiosk(){

    isunclutter=$(is_apt_installed "unclutter")
    isimagemagick=$(is_apt_installed "imagemagick")
    ischrome=$(is_apt_installed "chromium-browser")
    ischrome2=$(is_apt_installed "chromium")
    
    if [ $isunclutter -eq 0 ]; then
        apt-get install unclutter -y
    fi

    if [ $isimagemagick -eq 0 ]; then
        apt-get install imagemagick -y
    fi

    if [ $ischrome -eq 0 && $ischrome2 -eq 0 ]; then
        apt-get install chromium-browser -y

        if [ $? -eq 100 ]; then
            apt-get install chromium -y
        fi
    fi
    
    cp $local_base_dir/kiosk/wallpaper.jpg /usr/share/rpd-wallpaper/clouds.jpg
    
    if [ ! -f "/home/$local_user/kiosk.sh" ]; then
       cp $local_base_dir/kiosk/kiosk.sh /home/$local_user/kiosk.sh
       sed -i "s/###/$local_user/g" /home/$local_user/kiosk.sh
    fi

    if [ ! -f "/home/$local_user/restart-kiosk.sh" ]; then
       cp $local_base_dir/kiosk/restart-kiosk.sh /home/$local_user/restart-kiosk.sh
       sed -i "s/###/$local_user/g" /home/$local_user/restart-kiosk.sh
    fi

    if [ ! -f "/lib/systemd/system/kiosk.service" ]; then
       cp $local_base_dir/kiosk/kiosk.service /lib/systemd/system/kiosk.service
       sed -i "s/###/$local_user/g" /lib/systemd/system/kiosk.service
    fi

    if [ ! -d "/home/$local_user/.config/chromium/Default/Extensions/pjgjpabbgnnoohijnillgbckikfkbjed" ]; then
        tar -xvzf $local_base_dir/kiosk/chromium_config_folder.tar.gz --strip-components=2 -C /home/$local_user
        rm -rf /home/$local_user/.config/google-chrome/Singleton*

        if [ $ischrome2 -eq 1 ]; then
            sed -i "s/chromium-browse/chromium/g" /lib/systemd/system/kiosk.sh
            
        fi

    fi
    
}

server_host_address="192.168.1.31"
server_host_protocol="http"
server_host_port="8000"
client_local_www="/var/www/html"
local_user='suporte'

local_base_dir=$(pwd)

echo -ne 'Starting.. this will take some minutes.. please be patient'
echo -ne 'Running apt-get update..'
apt-get update >/dev/null 2>&1

echo -ne 'Installing basic software..'
basic_software_install

echo -ne 'Configuring index adoption page'
configuring_index_adoption_page

echo -ne 'Configuring nginx'
configuring_nginx

echo -ne 'Configuring kiosk'
configuring_kiosk


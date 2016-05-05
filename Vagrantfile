Vagrant.configure(2) do |config|
    config.vm.box = "ubuntu/trusty64"

  config.vm.provider "virtualbox" do |v|
    v.memory = 1024

  end

  # web server for ionic
  config.vm.network "forwarded_port", guest: 8100, host: 8100

  config.vm.provision "shell", privileged: false, inline: <<-SHELL
    sudo apt-get update
    sudo apt-get install -y git curl wget

    # node
    curl -sL https://deb.nodesource.com/setup_4.x | sudo bash -
    sudo apt-get install -y nodejs
    sudo apt-get install -y build-essential

    # ionic and related pre-reqs
    sudo npm install -g bower
    sudo npm install -g cordova
    sudo npm install -g ionic

    # bower deps
    cd /vagrant
    bower update
    npm install --no-bin-links

    echo 'to test:'
    echo 'cd /vagrant'
    echo 'ionic serve --address 0.0.0.0'
    echo '  http://localhost:8100'

    # ionic android needs Java...
    sudo add-apt-repository -y ppa:webupd8team/java
    sudo apt-get update
    echo 'do:\nsudo apt-get install -y oracle-java7-installer' 

    # cordova android needs android sdk
    cd
    [ -f android-sdk_r24.4.1-linux.tgz ] || wget http://dl.google.com/android/android-sdk_r24.4.1-linux.tgz
    [ -d android-sdk-linux ] || tar zxf android-sdk_r24.4.1-linux.tgz 
    echo "export PATH=${PATH}:${HOME}/android-sdk-linux/platform-tools:${HOME}/android-sdk-linux/tools" >> ~/.bashrc
    source ~/.bashrc
    # need Android 6.0 (API 23) (was 5.1.1, API 22) platform SDK; Android SDK Build-tools version 19.1.0 or higher; Android Support Repository (Extras)
    # needs user input (licenses)
    echo 'do:\nandroid update sdk --no-ui --filter build-tools,platform-tool,android-23,extra-android-m2repository'
    # sdk tool? android list sdk -a; android update sdk -u -a N...?!
    # NB ionic doesn't work with RC versions of build-tools - need to manually
    # install a stable one if needed (check filenames in .../build-tools/)

    # ubuntu for adb etc.
    sudo dpkg --add-architecture i386
    sudo apt-get update
    sudo apt-get install -y libncurses5:i386 libstdc++6:i386 zlib1g:i386

    cd /vagrant
    ionic platform add android

    # Android browsers up and including 4.4.4 probbly don't work with web audio
    # use alternative browser view (based on Chromium)
    echo 'Note: using crosswalk browser; to remove do ionic browser revert android'
    ionic browser add crosswalk
    # undo: ionic browser revert android

    # ionic resources doesn't work at the moment?!
    # I wonder if i need to log into ionic
    ionic resources
    # workaround...
    sudo apt-get install -y imagemagick
    sudo npm install cordova-splash --no-bin-links
    #mkdir platforms/android/res/drawable
    sudo npm install cordova-icon --no-bin-links
    cp resources/icon.png .
    ./node_modules/cordova-icon/bin/cordova-icon
    # note: generated in platform/android/res/drawable.../icon.png
    cp resources/splash.png .
    ./node_modules/cordova-icon/bin/cordova-splash
 
    echo 'do:\nionic build android'


    echo 'Note: to use USB install VirtualBox USB extension pack and ensure adb is run as root (sudo killall adb; sudo adb devices)'

  SHELL

end

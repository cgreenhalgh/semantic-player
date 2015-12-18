Vagrant.configure(2) do |config|
    config.vm.box = "ubuntu/trusty64"

  config.vm.provider "virtualbox" do |v|
    v.memory = 1024
  end

	# ionic serve
  config.vm.network "forwarded_port", guest: 8100, host: 8100
  
  config.vm.provision "shell", privileged: false, inline: <<-SHELL
    sudo apt-get install -y git

    # Node.js
    curl -sL https://deb.nodesource.com/setup_4.x | sudo bash -
    sudo apt-get install -y nodejs
    sudo apt-get install -y build-essential

    # --no-bin-links workaround for use on top of windows FS
    #npm install --no-bin-links

    sudo npm install -g cordova ionic
    
	# ubuntu for adb etc.
	sudo dpkg --add-architecture i386
	sudo apt-get update
	sudo apt-get install -y libncurses5:i386 libstdc++6:i386 zlib1g:i386

    # android needs java 7... 
    sudo add-apt-repository -y ppa:webupd8team/java
	sudo apt-get update
	# Won't work without user input 
	#sudo apt-get install -y oracle-java7-installer

	# cordova android needs android sdk
	cd
	[ -f android-sdk_r24.4.1-linux.tgz ] || wget http://dl.google.com/android/android-sdk_r24.4.1-linux.tgz
	[ -d android-sdk-linux ] || tar zxf android-sdk_r24.4.1-linux.tgz 
	echo "export PATH=${PATH}:${HOME}/android-sdk-linux/platform-tools:${HOME}/android-sdk-linux/tools" >> ~/.bashrc
	source ~/.bashrc
	# need Android 5.1.1 (API 22) platform SDK; Android SDK Build-tools version 19.1.0 or higher; Android Support Repository (Extras)
	# needs user input (licenses)
	android update sdk --no-ui --filter 1,platform-tool,android-22,extra-android-m2repository

	# app build
	cd /vagrant
        # windows shared dir: npm install --no-bin-links
	npm install --no-bin-links
	# however this means there won't be any commands, e.g. gulp
	sudo npm install -g gulp

	ionic platform add android
	# not working... (no platform-specific images)
	ionic resources 
	
	# try instead...
	sudo apt-get install -y imagemagick 
	sudo npm install --no-bin-links cordova-splash -g
	mkdir platforms/android/res/drawable
	sudo npm install --no-bin-links cordova-icon -g
	cp resources/icon.png .
	cordova-icon
	cp resources/splash.png .
	cordova-splash
	
	# missing various in lib...
	#sudo npm install --global gulp
	# error with node-sass 2.1.1
	#npm install node-sass

	# windows shared dir: npm install --no-bin-links
	gulp
	
	ionic build android
		

	echo 'Note: to install Java you need to...'
	echo 'sudo apt-get install -y oracle-java7-installer'
	echo 'Note: to install android SDK, etc., you need to...'
	echo 'android update sdk --no-ui --filter 1,platform-tool,android-22,extra-android-m2repository'

SHELL


end


var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: function() {
        //let device_id = "FA:46:B0:27:DA:CD";
        device_id = 0;

        const storage = window.localStorage;

        const permissions = cordova.plugins.permissions;

        var list = [
            permissions.SEND_SMS,
            permissions.READ_PHONE_STATE
        ];
            
        permissions.requestPermissions(
            list,
            function(status) {
              if( !status.hasPermission ) error();
            },
        error);

        function error() {
            console.warn('Permission is not turned on');
        }
          
        let current_page = "menu";
        const service_name = "CASQU'AD";

        const service_uuid = "ee04e830-6709-4f42-af61-3e66c48918b3";
        const analog_characteristic_uuid = "ee04e831-6709-4f42-af61-3e66c48918b3";
        const channel_characteristic_uuid = "ee04e832-6709-4f42-af61-3e66c48918b3";

        const message = document.getElementById('message');
        const mainButton = document.getElementById('mainButton');
        
        const phoneInput = document.querySelector("#inputnbr");

        const buttonPage = {
            menu: document.getElementById('menuButton'),
            dashboard:  document.getElementById('dashButton'),
            options: document.getElementById('optionButton')
        }

        buttonPage.menu.style.filter = "invert(28%) sepia(91%) saturate(3770%) hue-rotate(189deg) brightness(96%) contrast(101%)";
        console.log(navigator.vibrate);
        console.log(StatusBar);

        StatusBar.backgroundColorByName("white");
        StatusBar.styleDefault();

        if (device_id === 0) {
            ble.scan([], 120, scanSuccess, scanFailure);
            message.innerHTML = "start scan ...";
        } else {
            ble.connect(device_id, connectSuccess, connectFailure);
            message.innerHTML = "connect ....";
        }

        function scanSuccess(result) {
            if (result.name === service_name) {
                device_id = result.id;
                scanStop();
            }
        }

        function scanFailure(result) {
            message.innerHTML = "scan failure";
        }

        function scanStop() {
            ble.stopScan();
            ble.connect(device_id, connectSuccess, connectFailure);
            message.innerHTML = "connect ....";
        }

        function connectSuccess() {
            message.innerHTML = "connect success";
            ble.startNotification(device_id, service_uuid, analog_characteristic_uuid, notify_success, notify_failure);

        }

        function connectFailure(result) {
            message.innerHTML = "connect error";
        }

        function notify_success(buffer) {
            let view = new Uint8Array(buffer);
            if(view[0] === 0) fallDetected();
        }

        function notify_failure(reason) {
            message.innerHTML = "notify failure "+reason;
        }

        mainButton.addEventListener("click", changeLED);
        buttonPage.menu.addEventListener("click", () => switchPage("menu"));
        buttonPage.dashboard.addEventListener("click", () => switchPage("dashboard"));
        buttonPage.options.addEventListener("click", () => switchPage("options"));

        function switchPage(page) {
            if(page == current_page) return;
            document.querySelector(`#container-${current_page}`).style.display = "none";
            buttonPage[current_page].style.filter = ""
            current_page = page;
            buttonPage[page].style.filter = "invert(28%) sepia(91%) saturate(3770%) hue-rotate(189deg) brightness(96%) contrast(101%)"

            switch (current_page) {
                case "menu":
                    window.screen.orientation.lock('portrait');
                    document.querySelector("#container-menu").style.display = "flex";
                    document.querySelector("#header").style.display = "flex";
                    document.querySelector("#title").textContent = "CASQU'AD"
                    StatusBar.backgroundColorByHexString("#FFFFFF");
                    break;
                    
                case "dashboard": 
                    window.screen.orientation.lock('landscape');
                    document.querySelector("#container-dashboard").style.display = "flex";
                    document.querySelector("#header").style.display = "none";
                    StatusBar.backgroundColorByHexString("#E4E4E4");
                    break;

                case "options":
                    window.screen.orientation.lock('portrait');
                    document.querySelector("#header").style.display = "flex";
                    document.querySelector("#container-options").style.display = "flex";
                    document.querySelector("#title").textContent = "OPTIONS";
                    StatusBar.backgroundColorByHexString("#FFFFFF");

                    if(storage.getItem("phone")) {
                        phoneInput.value = storage.getItem("phone");
                    }
                    break;
            }
            
        }

        function changeLED() {
            navigator.vibrate(1000);
            let data = new Uint8Array(1);
            data[0] = 4;
            ble.write(device_id, service_uuid, channel_characteristic_uuid, data.buffer, ledSuccess, ledError);
        }

        const phoneButton = document.querySelector("#phone_entry > button:nth-child(2)");
            phoneButton.addEventListener("click", () => addNumber());

        function addNumber() {
            let content = phoneInput.value
            storage.setItem("phone", content);
            console.log(content + " added.")
        }

        const smsButton = document.querySelector("#phone_entry > button:nth-child(3)");
            smsButton.addEventListener("click", () => fallDetected());

        function sendSMS() {
            let options = {
                replaceLineBreaks: false, // true to replace \n by a new line, false by default
                android: {
                    intent: '' 
                }
            };

            const number = storage.getItem("phone");

            let oldColor = mainButton.style.backgroundColor;

            function success() { 
                smsButton.style.backgroundColor = "#107e00"
                setTimeout(() => {
                    smsButton.style.backgroundColor = oldColor;
                }, 2000) 
            };

            function error (e) {             
                smsButton.style.backgroundColor = "#8c0500";
                setTimeout(() => {
                    smsButton.style.backgroundColor = oldColor;
                }, 2000) 
            };


            let message = "Casqu'AD";
            console.log(number + " ---> " + message);
            navigator.geolocation.getCurrentPosition((position) => {

                message = `https://www.google.com/maps/search/?api=1&query=${position.coords.latitude},${position.coords.longitude}`
                sms.send(number, message, options, success, error);
            },
            (error) => {
                message = error.message
            } );
                
            
        }

        function fallDetected() {
            let timepass = 0
            for (var i = 1; i <= 30; i++) {
                var vibrate = function(i) {
                    
                    return function() {
                        navigator.vibrate(500);
                        timepass++
                        if(timepass >= 30) sendSMS();
                    }
                };
                setTimeout(vibrate(i), 1000 * i);

            }
            
        }

        function ledSuccess() {
            let oldColor = mainButton.style.backgroundColor;
            mainButton.style.backgroundColor = "#107e00"
            setTimeout(() => {
                mainButton.style.backgroundColor = oldColor;
            }, 2000)
        }

        function ledError(){
            let oldColor = mainButton.style.backgroundColor;
            mainButton.style.backgroundColor = "#8c0500";
            setTimeout(() => {
                mainButton.style.backgroundColor = oldColor;
            }, 2000)
        }
    }
};

app.initialize();

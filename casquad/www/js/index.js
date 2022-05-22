var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: function() {
        //let device_id = "FA:46:B0:27:DA:CD";
        device_id = 0;

        let current_page = "menu";
        const service_name = "CASQU'AD";

        const service_uuid = "ee04e830-6709-4f42-af61-3e66c48918b3";
        const analog_characteristic_uuid = "ee04e831-6709-4f42-af61-3e66c48918b3";
        const channel_characteristic_uuid = "ee04e832-6709-4f42-af61-3e66c48918b3";

        const message = document.getElementById('message');
        const mainButton = document.getElementById('mainButton');

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
            if(view[0] === 0) navigator.vibrate(1000);
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
                    break;
            }
            
        }

        function changeLED() {
            navigator.vibrate(1000);
            let data = new Uint8Array(1);
            data[0] = 4;
            ble.write(device_id, service_uuid, channel_characteristic_uuid, data.buffer, ledSuccess, ledError);
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

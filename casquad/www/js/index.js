var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },
    onDeviceReady: function() {
        //let device_id = "FA:46:B0:27:DA:CD";
        device_id = 0;
        const service_name = "CASQU'AD";

        const service_uuid = "ee04e830-6709-4f42-af61-3e66c48918b3";
        const analog_characteristic_uuid = "ee04e831-6709-4f42-af61-3e66c48918b3";
        const channel_characteristic_uuid = "ee04e832-6709-4f42-af61-3e66c48918b3";

        let message = document.getElementById('message');
        let ledButton = document.getElementById('ledButton');

        console.log(navigator.vibrate);
        console.log(StatusBar);

        StatusBar.backgroundColorByName("white");
        StatusBar.styleDefault();

        if (device_id === 0) {
            ble.scan([],120,scanSuccess,scanFailure);
            message.innerHTML = "start scan ...";
        } else {
            ble.connect(device_id,connectSuccess,connectFailure);
            message.innerHTML = "connect ....";
        }

        function scanSuccess(result) {
            // device_array.push(result)
            // scan_result += "</br>"+result.name;
            // scan_result += "</br>"+result.id;
            // message.innerHTML = scan_result;
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
            ble.startNotification(device_id,service_uuid,analog_characteristic_uuid,notify_success,notify_failure);

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

        $("#ledButton").bind("click",changeLED);
        $("#channelButton").bind("click",changeChannel);

        function changeLED(){
            navigator.vibrate(1000);
            let data = new Uint8Array(1);
            data[0] = 4;
            ble.write(device_id, service_uuid, channel_characteristic_uuid, data.buffer, ledSuccess, ledError);
        }

        function ledSuccess(){
            let oldColor = ledButton.style.backgroundColor;
            ledButton.style.backgroundColor = "#107e00"
            setTimeout(() => {
                ledButton.style.backgroundColor = oldColor;
            }, 2000)
        }

        function ledError(){
            let oldColor = ledButton.style.backgroundColor;
            ledButton.style.backgroundColor = "#8c0500";
            setTimeout(() => {
                ledButton.style.backgroundColor = oldColor;
            }, 2000)
        }
    }
};

app.initialize();

'use strict';

let gattServer = null;
let commandCharacteristic = null;

function connect() {
    console.log('Requesting MiP Robot Device...');
    if (!navigator.bluetooth) {
        alert('Web Bluetooth is disabled! Please go to chrome://flags and enable it.');
        return;
    }

    navigator.bluetooth.requestDevice(
        {
            filters: [{ services: [0xfff0] }],
            optionalServices: [0xffe5]
        })
        .then(device => {
            console.log('> Found ' + device.name);
            console.log('Connecting to GATT Server...');
	    document.getElementById("connstatus").innerHTML = "Connecting..."
            return device.gatt.connect();
        })
        .then(server => {
            gattServer = server;
            console.log('Getting Service 0xffe5 - Command control...');
            return server.getPrimaryService(0xffe5);
        })
        .then(service => {
            console.log('Getting Characteristic 0xffe9 - Command...');
            return service.getCharacteristic(0xffe9);
        })
        .then(characteristic => {
            console.log('All ready!');
	    document.getElementById("connstatus").innerHTML = "Connected!"
            commandCharacteristic = characteristic;
        })
        .catch(error => {
            console.error('Device connection failed', error);
	    document.getElementById("connstatus").innerHTML = "Connection failed"
        });
}

function sendCommand(...bytes) {
    var buffer = new ArrayBuffer(bytes.length);
    var view = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
        view[i] = bytes[i];
    }
    return commandCharacteristic.writeValue(buffer)
        .catch(err => console.log('Error when writing command! ', err));
}

function moveForward() {
    sendCommand(0x71, 0xff, 0x28);
}

function moveBackward() {
    sendCommand(0x72, 0xff, 0x28);
}

function turnLeft() {
    sendCommand(0x73, 0x10, 0xb8);
}

function turnRight() {
    sendCommand(0x74, 0x10, 0xb8);
}

function getKeyAndMove(e){				
	var key_code=e.which||e.keyCode;
	switch(key_code){
		case 37: //left arrow key
			turnLeft();
			break;
		case 38: //Up arrow key
			moveForward();
			break;
		case 39: //right arrow key
			turnRight();
			break;
		case 40: //down arrow key
			moveBackward();
			break;						
	}
}

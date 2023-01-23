# A Ponglike Game

More to come; but to run this on your own machine after cloning, execute the
following commands from the root of the project:

```
npm i
(cd src && node ./app.js)
```

## Requirements

* Node v16 (though earlier may work)

## Setup

In order for IoT Hub capabilities to work, you'll need to place one file (`iothub.json`)
in the root of this project (same directory as this `README.md` file), and the contents
should be:

```
{
    "connectionString": "your-azure-iot-hub-device-connection-string-here"
}
```

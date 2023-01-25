const { Message, Client } = require('../../node_modules/azure-iot-device')
const { Mqtt } = require('../../node_modules/azure-iot-device-mqtt')
const { Subject } = require('../../node_modules/rxjs')
const iotHubConfiguration = require('../../iothub.json')

class IotHubService {
  /** @type {string} */
  #connectionString = iotHubConfiguration.connectionString

  /** @type {Client} */
  #client = null

  /** @type {Subject} */
  #inboundMessages = null

  get inboundMessages () {
    return this.#inboundMessages
  }

  constructor () {
    this.#inboundMessages = new Subject(null)

    this.#client = Client.fromConnectionString(this.#connectionString, Mqtt)

    this.#client.on('connect', this.#onConnected.bind(this))
    this.#client.on('error', this.#onError.bind(this));
    this.#client.on('disconnect', this.#onDisconnected.bind(this))
    this.#client.on('message', this.#onMessageReceived.bind(this))
  }

  connect () {
    this.#client.open().catch((err) => {
      console.error('Could not connect: ' + err.message)
    })
  }

  /**
   * @param {string} messageAsJson
   */
  sendMessage (messageAsJson) {
    const message = new Message(messageAsJson)
    this.#client.sendEvent(message, () => {})
  }

  #onConnected () {
    // console.log('Client connected')
  }

  #onDisconnected () {
    this.#client.open().catch((err) => {
      // console.error(err.message)
    })
  }

  /**
   * @param {ArrayBuffer} msg
   */
  #onMessageReceived (msg) {
    this.#inboundMessages.next(msg.data.toString())
    this.#client.complete(msg, () => {})
  }

  #onError (err) {
    // console.error(err.message)
  }
}

module.exports = IotHubService

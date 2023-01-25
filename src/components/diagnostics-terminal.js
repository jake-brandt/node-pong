/* eslint-disable */
const blessed = require("blessed")
const IotHubService = require("../services/iot-hub-service")
/* eslint-enable */

class DiagnosticsTerminal {
  /** @type {blessed} */
  #blessedScreen = null
  /** @type {IotHubService} */
  #iotHubService = null
  /** @type {blessed.Log} */
  #log = null

  /**
   * @param {blessed} blessedScreen
   * @param {IotHubService} iotHubService
   */
  constructor (blessedScreen, iotHubService) {
    this.#blessedScreen = blessedScreen
    this.#iotHubService = iotHubService

    this.#log = new blessed.Log({
      width: '33%',
      height: '25%',
      left: '60%',
      top: '70%',
      border: {
        type: 'line'
      },
      style: {
        bg: 'black',
        fg: 'white',
        border: {
          bg: 'black',
          fg: 'white'
        }
      }
    })
  }

  start () {
    this.#blessedScreen.append(this.#log)
    this.#iotHubService.inboundMessages.subscribe(this.log.bind(this))
    this.log('Logging started...')
  }

  log (msg) {
    this.#log.log('[INFO] ' + msg)
  }

  error (msg) {
    this.#log.log('[ERROR] ' + msg)
  }
}

module.exports = DiagnosticsTerminal

import React, { Component } from 'react';
import Quagga from 'quagga';

const canGetUserMedia = navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function';
const isIsbn = string => /^(97(8|9))?\d{9}(\d|X)$/.test(string);

export default class Scanner extends Component {
  componentDidMount() {
    if (canGetUserMedia) {
      Quagga.init({
        inputStream : {
          name : "Live",
          type : "LiveStream",
          target: document.querySelector('#preview')
        },
        decoder : {
          readers : ["code_128_reader"]
        }
      }, (err) => {
          if (err) {
              console.log(err);
              return
          }
          console.log("Initialization finished. Ready to start");
          Quagga.start();
          Quagga.onDetected(this.handleScan);
      })
    }
  }

  componentWillUnmount() {
    Quagga.stop();
    Quagga.offDetected(this.handleScan);
  }

  handleScan = ({ codeResult: { code }}) => {
    if (isIsbn(code)) {
      console.log('have me a code', code);
    } else {
      console.log('this is a bogus code', code);
    }
  }

  render() {
    return (
      canGetUserMedia
        ? <video id='preview' />
        : (
          <p>
            Your device or browser does not support getting media from your camera.<br/>
            Try installing the latest version of your browser.
          </p>
        )
      )

  }
}

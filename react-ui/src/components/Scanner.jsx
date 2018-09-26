import React, { Component } from 'react';
import Quagga from 'quagga';
import _ from 'lodash';

const canGetUserMedia = navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function';
const isIsbn = string => /^(97(8|9))?\d{9}(\d|X)$/.test(string);

const initialConfig = {
  inputStream: {
    type : "LiveStream",
    target: '#scanner-preview',
    name: 'Live',
    constraints: {
        width: {min: 640},
        height: {min: 480},
        facingMode: "environment",
        aspectRatio: {min: 1, max: 2}
    }
  },
  locator: {
    patchSize: "medium",
    halfSample: true
  },
  numOfWorkers: 8,
  frequency: 10,
  decoder: {
    readers : [{
        format: "ean_reader",
        config: {}
    }]
  },
  locate: true
};

export default class Scanner extends Component {
  state = {}
  componentDidMount() {
    if (canGetUserMedia) {
      Quagga.init(initialConfig, (err) => {
          if (err) {
              console.log(err);
              return
          }
          console.log("Initialization finished. Ready to start");
          Quagga.start();
          Quagga.onDetected(this.handleDetection);
          Quagga.onProcessed(this.handleProcessed);
      });  
    }
  }

  componentWillUnmount() {
    Quagga.stop();
    Quagga.offDetected(this.handleDetection);
  }

  handleProcessed = (result) => {
    _.get(result, 'codeResult.code') && console.log(_.get(result, 'codeResult.code'));
    var drawingCtx = Quagga.canvas.ctx.overlay,
        drawingCanvas = Quagga.canvas.dom.overlay;

    if (result) {
      if (result.boxes) {
        drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
        result.boxes.filter(function (box) {
            return box !== result.box;
        }).forEach(function (box) {
            Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
        });
      }

      if (result.box) {
        Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
      }

      if (result.codeResult && result.codeResult.code) {
        Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
      }
    }   
  }

  handleDetection = ({ codeResult: { code }}) => {
    this.setState({
      resultText: code,
    });
  }

  render() {
    if (!canGetUserMedia) return (
      <p>
        Your device or browser does not support getting media from your camera.<br/>
        Try installing the latest version of your browser.
      </p>
    );

    const { resultText } = this.state;
    return (
      <div>
        <code>{ resultText }</code>
        <div id='scanner-preview' className='scanner-preview' />
      </div>
    );
  }
}

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
    readers : [
      "code_128_reader",
      "ean_reader",
      "ean_8_reader"
    ],
  },
  locate: true
};

export default class Scanner extends Component {
  state = {
    resultTexts: [],
  }

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
    Quagga.offProcessed(this.handleProcessed);
  }

  handleProcessed = (result) => {
    const drawingCtx = Quagga.canvas.ctx.overlay;
    const drawingCanvas = Quagga.canvas.dom.overlay;


    if (_.get(result, 'boxes')) {
      drawingCtx.clearRect(
        0,
        0,
        parseInt(drawingCanvas.getAttribute("width")),
        parseInt(drawingCanvas.getAttribute("height"))
      );
      result.boxes.filter(box =>  box !== result.box)
        .forEach((box) => {
          Quagga.ImageDebug.drawPath(
            box,
            {x: 0, y: 1},
            drawingCtx,
            {color: "green", lineWidth: 2}
          );
        });
    }

    if (_.get(result, 'box')) {
      Quagga.ImageDebug.drawPath(
        result.box,
        {x: 0, y: 1},
        drawingCtx,
        {color: "#00F", lineWidth: 2}
      );
    }

    if (_.get(result, 'codeResult.code')) {
      Quagga.ImageDebug.drawPath(
        result.line,
        {x: 'x', y: 'y'},
        drawingCtx,
        {color: 'red', lineWidth: 3}
      );
    }
  }

  handleDetection = (result) => {
    const code = _.get(result, 'codeResult.code');
    code && this.setState(({resultTexts}) => ({
      resultTexts: [...resultTexts, code]
    }));
  }

  render() {
    if (!canGetUserMedia) return (
      <p>
        Your device or browser does not support getting media from your camera.<br/>
        Try installing the latest version of your browser.
      </p>
    );

    const { resultTexts } = this.state;
    return (
      <div>
        { resultTexts.map(resultText => (
          <code style={{...isIsbn(resultText) && { backgroundColor: 'red' } }}>{ resultText }, </code>)
        )}
        <div id='scanner-preview' className='scanner-preview' />
      </div>
    );
  }
}

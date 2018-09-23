/* global alert, navigator, document, console */

import React from 'react';
import { hot } from 'react-hot-loader';
import axios from 'axios';
import io from 'socket.io-client';

import './App.css';

import Progress from './Progress';
import Parameters from './Parameters';
import Toggle from './Toggle';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Resulting image path returned from the backend.
      impath: '',
      // Job ID of the task running on the backend.
      jid: undefined,
      // Shows the settings for parameter tweaking.
      showSettings: false,
      // Whether to show camera view or parameters view.
      showParametersView: false,
      // When the image has finished cooking this becomes true.
      dreamt: false,
      // Available models.
      models: [],
      // Currently selected model.
      model: undefined,
      // Parameters to run the model with.
      parameters: {},
    };
    
    // Method binding.
    this.handleUpload = this.handleUpload.bind(this);
    this.onSnap = this.onSnap.bind(this);
    this.onTryAgain = this.onTryAgain.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onToggleParametersViewChange = this.onToggleParametersViewChange.bind(this);
  }

  componentDidMount() {
    this.initializeCamera();
    axios.get('/models')
      .then(res => {
        this.setState({ models: res.data });
        this.setState({ model: res.data[0] });
      })
  }

  // Sets up HTML5 features to couple up a canvas with the webcam.
  initializeCamera() {
    function hasGetUserMedia() {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    if (hasGetUserMedia()) {
      const constraints = {
        video: true,
      };

      const video = document.querySelector('video');

      function handleSuccess(stream) {
        video.srcObject = stream;
      }

      function handleError(error) {
        console.error('Rejected :(', error);
      }

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(handleSuccess)
        .catch(handleError);
    } else {
      alert('Oh no, getUserMedia is not available :(');
    }
  }

  onSnap() {
    // TODO: review
    this.refs.videoRef.pause();
    const canvas = document.createElement('canvas');
    canvas.width = this.refs.videoRef.videoWidth;
    canvas.height = this.refs.videoRef.videoHeight;
    canvas.getContext('2d').drawImage(this.refs.videoRef, 0, 0);
    const encodedImage = canvas.toDataURL('image/jpg');

    axios
      .post('/snap', { image: encodedImage })
      .then((res) => {
        this.setState({
          jid: res.data.body,
        });
      })
      .catch(err => console.error(err));

  }

  onTryAgain() {
    this.setState({ jid: '', dreamt: false });
    this.refs.videoRef.play();
  }

  onCancel() {
    axios
      .post(`/cancel/${this.state.jid}`)
      .then(res => {
        this.setState({jid: '', dreamt: false});
        this.refs.videoRef.play();
        // TODO: make sure the Progress component unsubscribes before it dies.
      })
  }

  // When using file upload dialog.
  handleUpload(ev) {
    const data = new FormData();
    data.append('file', ev.target.files[0]);
    axios.post('/upload', data).then(res => {
      if (res.data.status === 500) {
        console.error(res.data.message);
      } else {
        this.setState({impath: res.data.body});
      }
    });
  }

  // Swaps between the camera view and the parameters view.
  onToggleParametersViewChange() {
    this.setState({ showParametersView: !this.state.showParametersView })
  }

  render() {
    let buttonText;
    let buttonClasses;
    let buttonCallback;

    let mode; // Can be either posing, calculating or dreamt.
    if (!!this.state.jid) {
      mode = this.state.dreamt ? 'dreamt' : 'calculating';
    } else {
      mode = 'posing';
    }

    switch(mode) {
      case 'posing':
        buttonText = 'Snap';
        buttonClasses = 'button snap';
        buttonCallback = () => this.onSnap();
        break;

      case 'calculating':
        buttonText = 'Cancel';
        buttonClasses = 'button cancel';
        buttonCallback = () => this.onCancel();
        break;

      case 'dreamt':
        buttonText = 'Again';
        buttonClasses = 'button again';
        buttonCallback = () => this.onTryAgain();
        break;
    }

    if (this.state.showParametersView) {
      buttonClasses += ' hide';
    }

    return (
      <div id="App">
        <div id="header">
          <button className={buttonClasses} onClick={buttonCallback}>
            {buttonText}
          </button>
          <Toggle
            switch={this.state.showParametersView}
            onChange={this.onToggleParametersViewChange}
          />
        </div>
        <div id="middle">
          <canvas style={{ display: 'none' }} />
          {this.state.showParametersView &&
              <Parameters model={this.state.model} models={this.state.models} />
          }
          {mode !== 'posing' &&
              <Progress
                onLoaded={() => this.setState({dreamt: true})}
                jobId={this.state.jid}
              >
                <img alt="deep" src={`/uploads/${this.state.jid}.jpg`} />
              </Progress>
          }
        <video
          autoPlay
          ref="videoRef"
          className={
            ['dreamt', 'calculating'].includes(mode) ||
            this.state.showParametersView ? 'hide' : ''
          }
        />
        </div>
        <div id="footer" />
      </div>
    );
  }
}

export default hot(module)(App);

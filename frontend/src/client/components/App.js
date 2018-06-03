import React from 'react'
import { hot } from 'react-hot-loader'
import axios from 'axios';
import './App.css';
import Progress from './Progress.js';
import Loader from 'react-loader';


class App extends React.Component {
  constructor() {
    super();
    this.state = {
      // Resulting image path returned from the backend.
      impath: '',
      // State defining the moment when image is loading or loaded.
      snapped: false 
    };

    // Method binding.
    this.buttonClicked = this.buttonClicked.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.snap = this.snap.bind(this);
  }

  componentDidMount() {
    this.initializeCamera();
  }

  // Sets up HTML5 features to couple up a canvas with the webcam.
  initializeCamera() {
    function hasGetUserMedia() {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    if (hasGetUserMedia()) {
      const constraints = {
        video: true
      };
      const video = document.querySelector('video');

      function handleSuccess(stream) {
        video.srcObject = stream;
      }

      function handleError(error) {
        console.error("Rejected :(", error);
      }

      navigator.mediaDevices.getUserMedia(constraints)
        .then(handleSuccess)
        .catch(handleError);
    } else {
      alert('Oh, getUserMedia is not available :(');
    }
  }

  // Fired when the Snap / Try Again button is clicked.
  buttonClicked() {
    const snapped = !this.state.snapped;
    if (snapped) {
      this.snap();
    } else {
      this.setState({ impath: '' });
    }
  }

  // When using web camera.
  snap() {
    this.setState({ snapped: true });
    const video = document.querySelector('video');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const encodedImage = canvas.toDataURL('image/jpg');

    axios.post('/snap', {image: encodedImage})
      .then(res => {
        console.log(res.data);
        this.setState({
          impath: res.data.body
        });
      })
      .catch(err => console.error(err));
  }

  // When using file upload dialog.
  handleUpload(ev) {
    const data = new FormData();
    data.append('file', ev.target.files[0]);
    axios.post('/upload', data)
      .then(res => {
        if (res.data.status === 500) {
          console.error(res.data.message); 
        } else {
          this.setState({
            impath: res.data.body,
            snapped: true
          });
        }
      });
  }

  render() {
    let buttonText;
    let buttonClasses;
    let result;

    if (this.state.snapped) {
      buttonText = 'Again';
      buttonClasses = 'button again';
      result = (
        <Progress endpoint="/progress">
          <img alt="deep" src={this.state.impath} />
        </Progress>
      );
    } else {
      buttonText = 'Snap';
      buttonClasses = 'button snap';
      result = '';
    }

    return (
      <div className="App">
        <div id="header">
          <button
            className={buttonClasses}
            onClick={this.buttonClicked}>{buttonText}</button>
        </div>
        <div id="middle">
          <canvas style={{display: "none"}}></canvas>
          {result}
          <video style={{display: this.state.snapped ? "none" : "initial"}} autoPlay></video>
        </div>
        <div id="footer"></div>
      </div>
    )
  }
}

export default hot(module)(App)

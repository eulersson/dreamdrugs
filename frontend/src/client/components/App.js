import React from 'react'
import { hot } from 'react-hot-loader'
import axios from 'axios';
import './App.css';

class App extends React.Component {
  constructor() {
    super();
    this.state = { 
      impath: '',
      snapped: false
    };
    this.buttonClicked = this.buttonClicked.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.snap = this.snap.bind(this);
  }

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
      alert('getUserMedia is not available :(');
    }
  }

  buttonClicked() {
    const snapped = !this.state.snapped;
    this.setState({ snapped: snapped });
    if (snapped) {
      this.snap();
    } else {
      console.log("reverting!");
    }
  }

  snap() {
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
          impath: res.data.body,
          snapped: true
        });
      })
      .catch(err => console.error(err));
  }

  componentDidMount() {
    this.initializeCamera();
  }

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
    let main;
    let buttonStyle;
    let buttonText;
    let buttonClasses;
    if (this.state.snapped) {
      //main = <img alt="deep" src={this.state.impath} />;
      buttonText = 'Again';
      buttonClasses = 'button again';
    } else {
      //main = <video autoPlay></video>
      buttonText = 'Snap';
      buttonClasses = 'button snap';
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
          <img style={{display: this.state.snapped ? "initial" : "none"}} alt="deep" src={this.state.impath} />
          <video style={{display: this.state.snapped ? "none" : "initial"}} autoPlay></video>
        </div>
        <div id="footer"></div>
      </div>
    )
  }
}

export default hot(module)(App)

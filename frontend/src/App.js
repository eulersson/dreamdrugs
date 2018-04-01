import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = { impath: '' }
    this.handleUpload = this.handleUpload.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    function hasGetUserMedia() {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    if (hasGetUserMedia()) {
      const constraints = { audio: false, video: true };
      const video = document.querySelector('video');

      function handleSuccess(stream) {
        console.log(stream);
        video.srcObject = stream;

        console.log(video.videoWidth);
        console.log(video.videoHeight);
        this.setState({
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight
        });
      }

      function handleError(error) {
        console.error('Rejected!', error);
      }

      navigator.mediaDevices.getUserMedia(constraints)
        .then(handleSuccess)
        .catch(handleError)

    } else {
      console.error("Get user media not supported :(");
    }
 
  }

  handleClick() {
    console.log('Button has been clicked.');
    const video = document.querySelector('video');
    const canvas = document.querySelector('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    this.setState({impath: canvas.toDataURL('image/jpeg')});
  }

  handleUpload(ev) {
    const data = new FormData();
    data.append('file', ev.target.files[0]);
    axios.post('/upload', data)
      .then(res => {
        if (res.data.status === 500) {
          console.error(res.data.message); 
        } else {
          this.setState({ impath: res.data.body });
        }
      });
  }

  render() {
    const ifNoImage = this.state.impath === '';
    const im = ifNoImage ? '' : <img alt="img" src={this.state.impath} />
    return (
      <div className="App">
          <button onClick={this.handleClick}>snap</button>
          <video autoPlay></video>
          <canvas style={{display: 'none'}}></canvas>
          <input type="file" onChange={this.handleUpload}/>
          {im}
      </div>
    );
  }
}

export default App;

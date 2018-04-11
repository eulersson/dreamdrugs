import React from 'react'
import { hot } from 'react-hot-loader'
import axios from 'axios';

class HelloWorld extends React.Component {
  constructor() {
    super();
    this.state = { 
      impath: ''
    };
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
        this.setState({ impath: res.data });
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
          this.setState({ impath: res.data.body });
        }
      });
  }

  render() {
    const ifNoImage = this.state.impath === '';
    const im = ifNoImage ? '' : <img alt="img" src={this.state.impath} />
    return (
      <div className="HelloWorld">
        <button onClick={this.snap}>Snap</button>
        <canvas style={{display: "none"}}></canvas>
        <video autoPlay></video>
        <input type="file" onChange={this.handleUpload}/>
        {im}
      </div>
    )
  }
}

export default hot(module)(HelloWorld)

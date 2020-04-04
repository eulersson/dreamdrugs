import axios from "axios";

import { hot } from "react-hot-loader/root";

import React from "react";

import Progress from "./Progress";
import Parameters from "./Parameters";
import Toggle from "./Toggle";

import "./App.css";

class App extends React.Component {
  // TODO: Set prototypes.
  state = {
    // Resulting image path returned from the backend.
    impath: "",
    // Job ID of the task running on the backend.
    jid: undefined,
    // Shows the settings for parameter tweaking.
    showSettings: false,
    // Whether to show camera view or parameters view.
    showParametersView: false,
    // When the image has finished cooking this becomes true.
    dreamt: false,
    // Available models for use.
    availableModels: [],
    // Currently selected model.
    currentModel: undefined,
    signature: {},
    // Parameters to run the model with.
    parameters: {}
  };

  constructor(props) {
    super(props);

    // Method binding.
    this.handleUpload = this.handleUpload.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onSnap = this.onSnap.bind(this);
    this.onToggleParametersViewChange = this.onToggleParametersViewChange.bind(
      this
    );
    this.onTryAgain = this.onTryAgain.bind(this);
    this.setParameters = this.setParameters.bind(this);
    this.onModelChanged = this.onModelChanged.bind(this);
  }

  componentDidMount() {
    this.initializeCamera();
    axios.get("/models").then(res => {
      this.setState({ availableModels: res.data });
      this.setState({ currentModel: res.data[0] });
      this.onModelChanged();
    });
  }

  onModelChanged() {
    axios
      .get(`/signature/${this.state.currentModel}`)
      .then(res => {
        console.log(res);
        this.setState({ signature: res.data });
        const parameters = {};
        Object.keys(res.data).forEach(
          p => (parameters[p] = res.data[p].default)
        );
        if (Object.keys(this.state.parameters).length === 0) {
          this.setParameters(this.state.currentModel, parameters);
        }
      })
      .catch(err => console.error(err));
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

      const video = document.querySelector("video");

      function handleSuccess(stream) {
        video.srcObject = stream;
      }

      function handleError(error) {
        console.error("Rejected :(", error);
      }

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(handleSuccess)
        .catch(handleError);
    } else {
      alert("Oh no, getUserMedia is not available :(");
    }
  }

  // Takes a picture and posts it to the server. The job id is returned so we
  // can retrieve progress udpates via redis.
  onSnap() {
    // TODO: Review.
    this.refs.videoRef.pause();
    const canvas = document.createElement("canvas");
    canvas.width = this.refs.videoRef.videoWidth;
    canvas.height = this.refs.videoRef.videoHeight;
    canvas.getContext("2d").drawImage(this.refs.videoRef, 0, 0);
    const encodedImage = canvas.toDataURL("image/jpg");

    axios
      .post("/snap", {
        image: encodedImage,
        parameters: {
          ...this.state.parameters,
          model: this.state.currentModel
        }
      })
      .then(res => {
        this.setState({
          jid: res.data.body
        });
      })
      .catch(err => console.error(err));
  }

  // Brings back user to camera mode.
  onTryAgain() {
    this.setState({ jid: "", dreamt: false });
    this.refs.videoRef.play();
  }

  // When a job started it is possible to cancel it.
  onCancel() {
    axios.post(`/cancel/${this.state.jid}`).then(res => {
      this.setState({ jid: "", dreamt: false });
      this.refs.videoRef.play();
      // TODO: Make sure the Progress component unsubscribes before it dies.
    });
  }

  // When using file upload dialog instead of camera.
  handleUpload(ev) {
    const data = new FormData();
    data.append("file", ev.target.files[0]);
    axios.post("/upload", data).then(res => {
      if (res.data.status === 500) {
        console.error(res.data.message);
      } else {
        this.setState({ impath: res.data.body });
      }
    });
  }

  // Swaps between the camera view and the parameters view.
  onToggleParametersViewChange() {
    if (
      // If we need to show parameters and needed state is not initialized:
      !this.state.showParametersView &&
      (!this.state.availableModels.length || !!this.state.currentModel)
    ) {
      axios.get("/models").then(res => {
        this.setState({ availableModels: res.data });
        this.setState({ currentModel: res.data[0] });
        this.setState({ showParametersView: !this.state.showParametersView });
      });
    } else {
      // Needed state is initialized, parameters can be safely shown:
      this.setState({ showParametersView: !this.state.showParametersView });
    }
  }

  // Passed to the Parameters view for state lifting.
  setParameters(model, parameters) {
    this.setState({
      currentModel: model,
      parameters
    });
  }

  render() {
    let buttonText;
    let buttonClasses;
    let buttonCallback;

    let mode; // Can be either posing, calculating or dreamt.
    if (this.state.jid) {
      mode = this.state.dreamt ? "dreamt" : "calculating";
    } else {
      mode = "posing";
    }

    switch (mode) {
      case "posing":
        buttonText = "Snap";
        buttonClasses = "button snap";
        buttonCallback = () => this.onSnap();
        break;

      case "calculating":
        buttonText = "Cancel";
        buttonClasses = "button cancel";
        buttonCallback = () => this.onCancel();
        break;

      case "dreamt":
        buttonText = "Again";
        buttonClasses = "button again";
        buttonCallback = () => this.onTryAgain();
        break;
    }

    if (this.state.showParametersView) {
      buttonClasses += " hide";
    }

    const backgroundColor = this.state.showParametersView ? "#21794d" : "#000";

    const headerStyle = {
      visibility: this.state.showParametersView ? "hidden" : "visible"
    };

    const toggleStyle = {
      visibility: this.state.showParametersView ? "visible" : "hidden"
    };

    return (
      <div id="App" style={{ backgroundColor }}>
        <div id="header" style={headerStyle}>
          <button className={buttonClasses} onClick={buttonCallback}>
            {buttonText}
          </button>
          <Toggle
            style={toggleStyle}
            switch={this.state.showParametersView}
            onChange={this.onToggleParametersViewChange}
          />
        </div>
        <div id="middle">
          <canvas style={{ display: "none" }} />
          {this.state.showParametersView && (
            <Parameters
              model={this.state.currentModel}
              models={this.state.availableModels}
              signature={this.state.signature}
              parameters={this.state.parameters}
              setParameters={this.setParameters}
              onModelChanged={this.onModelChanged}
            />
          )}
          {mode !== "posing" && (
            <Progress
              onLoaded={() => this.setState({ dreamt: true })}
              jobId={this.state.jid}
            >
              <img alt="deep" src={`/uploads/${this.state.jid}.jpg`} />
            </Progress>
          )}
          <video
            autoPlay
            ref="videoRef"
            className={
              ["dreamt", "calculating"].includes(mode) ||
              this.state.showParametersView
                ? "hide"
                : ""
            }
          />
        </div>
        <div id="footer" />
      </div>
    );
  }
}

export default hot(App);

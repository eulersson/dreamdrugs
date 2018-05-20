import React from 'react'
import { hot } from 'react-hot-loader'
import axios from 'axios';
import './Progress.css';


class Progress extends React.Component {
  constructor() {
    super();

    this.state = {
      progress: 0,
      loaded: false
    };
  }

  componentDidMount() {
    console.log(this.props);
    const that = this;
    function fetchProgress() {
      axios.get('/progress')
        .then(res => {
          const progress = res.data.progress;
          that.setState({ progress: progress });
          if (progress != 100) {
            setTimeout(fetchProgress, 350);
          } else {
            that.setState({ loaded: true });
          }
        });
    };
    fetchProgress();
  }

  render() {
    if (this.state.loaded) {
      return this.props.children
    } else {
      return (
        <div className="Progress">
          <div className="percentage">{this.state.progress}%</div>
        </div>
      );
    }
  }
}

export default hot(module)(Progress)

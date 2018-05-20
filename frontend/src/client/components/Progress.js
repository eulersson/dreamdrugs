import React from 'react'
import { hot } from 'react-hot-loader'
import axios from 'axios';
import './Progress.css';


class Progress extends React.Component {
  constructor() {
    super();

    this.state = {
      progress: 0
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
          }
        });
    };
    fetchProgress();
  }

  render() {
    return <div className="Progress">{this.state.progress}</div>
  }
}

export default hot(module)(Progress)

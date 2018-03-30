import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  state = {users: ['giii']};

  componentDidMount() {
    console.log("im here!!!!");
    fetch('/users')
      .then(res => {
        console.log(res);
        return res.json()
      })
      .then(data => {
        console.log(data);
        this.setState({ users: JSON.stringify(data) })
      });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <p>Users: {this.state.users}</p>
      </div>
    );
  }
}

export default App;

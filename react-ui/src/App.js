import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Scanner from './components/Scanner';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: null,
      fetching: true,
      showScanner: false,
    };
  }

  componentDidMount() {
    fetch('/api')
      .then(response => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        return response.json();
      })
      .then(json => {
        this.setState({
          message: json.message,
          fetching: false
        });
      }).catch(e => {
        this.setState({
          message: `API call failed: ${e}`,
          fetching: false
        });
      })
  }

  toggleShowScanner = () => {
    this.setState(({ showScanner }) => ({ showScanner: !showScanner }));
  }

  render() {
    const { showScanner } = this.state;
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          {'This is '}
          <a href="https://github.com/mars/heroku-cra-node">
            {'create-react-app with a custom Node/Express server'}
          </a><br/>
        </p>
        <p className="App-intro">
          {this.state.fetching
            ? 'Fetching message from API'
            : this.state.message
          }
        </p>
        <p className='App-scanner'>
          <button onClick={this.toggleShowScanner}>
            { showScanner ? 'Stop Scanning' : 'Scan for ISBN from barcode' }
          </button>
          {this.state.showScanner && <Scanner />}
        </p>
      </div>
    );
  }
}

export default App;

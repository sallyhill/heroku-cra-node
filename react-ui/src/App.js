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

  onIsbnInputChange = ({target: { value }}) => console.log(value);

  toggleIsbnInput = () => {
    this.setState(({ showIsbnInput }) => ({ showIsbnInput: !showIsbnInput }));
  }

  toggleShowScanner = () => {
    this.setState(({ showScanner }) => ({ showScanner: !showScanner }));
  }

  render() {
    const { showScanner, showIsbnInput } = this.state;
    return (
      <div className="App">
        <div className="App-header">
          <h2>Book Tagger</h2>
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
        <div className='App-scanner'>
          <div className='buttons'>
            <button onClick={this.toggleShowScanner}>
              <span>{ showScanner ? 'Stop Scanning' : 'Scan for ISBN from barcode' }</span>
            </button>
            <button onClick={this.toggleIsbnInput}>
              <span>Add ISBN code manually</span>
            </button>
          </div>
          <div>
            {showScanner && <Scanner />}
            {showIsbnInput && <input onChange={this.onIsbnInputChange} />}
          </div>
        </div>
      </div>
    );
  }
}

export default App;

import React    from 'react';
import ReactDOM from 'react-dom';

class App extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
    }
  }

  componentDidMount() {

  }

  render() {
    return(
      <h1>你好，世界</h1>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));

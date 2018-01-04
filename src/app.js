import React    from 'react';
import ReactDOM from 'react-dom';
require('semantic-ui-css/semantic.min.css');

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
      <div className="ui fixed blue inverted menu">
        <a href="#" className="header item">
          应用名称
        </a>
        <a href="#" className="ui right item">
          设置
        </a>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));

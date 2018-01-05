import React    from 'react';
import ReactDOM from 'react-dom';
import 'semantic-ui-css/semantic.min.js';

require('semantic-ui-css/semantic.min.css');
require('./style.less');

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
      <section className="home">
        <div className="ui fixed blue inverted menu">
          <a href="#" className="header item">
            汲爽计时
          </a>
          <div className="right menu">
            <a className="item" onClick={this.renderAddPopup}>
              <i className="plus icon"></i>
              添加新记录
            </a>
            <a className="item" onClick={this.renderSettingPopup}>
              <i className="setting icon"></i>
              设置
            </a>
          </div>
        </div>
        <section className="ui container main">
          <table className="ui celled blue table">
            <thead>
              <tr>
                <th>序号</th>
                <th>机器编号</th>
                <th>上机时间</th>
                <th>下机时间</th>
                <th>金额</th>
                <th>倒计时</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr className="negative">
                <td>1</td>
                <td>1</td>
                <td>12月15日 12:32</td>
                <td>12月15日 14:32</td>
                <td>15元</td>
                <td>00:01</td>
                <td>更新</td>
              </tr>
              <tr>
                <td>2</td>
                <td>2</td>
                <td>12月15日 12:32</td>
                <td>12月15日 14:32</td>
                <td>15元</td>
                <td>14:32</td>
                <td>更新</td>
              </tr>
              <tr>
                <td>3</td>
                <td>3</td>
                <td>12月15日 12:32</td>
                <td>12月15日 14:32</td>
                <td>15元</td>
                <td>14:32:12</td>
                <td>更新</td>
              </tr>
            </tbody>
          </table>
        </section>
        <div className="ui modal add-record">
          <div className="ui center aligned grid header">添加上机记录</div>
          <div className="content">
            <div className="ui form">
              <div className="field">
                <label>机器编号</label>
                <input type="number" name="computer-num" placeholder="请填写数字" />
              </div>
              <div className="field">
                <label>金额</label>
                <input type="number" name="price" placeholder="请填写数字" />
              </div>
              <button className="fluid ui blue button" type="submit">添加</button>
            </div>
          </div>
        </div>
        <div className="ui modal setting">
          <div className="ui center aligned grid header">设置</div>
          <div className="content">
            <div className="ui form">
              <div className="field">
                <label>机器编号</label>
                <input type="number" name="computer-num" placeholder="请填写数字" />
              </div>
              <div className="field">
                <label>金额</label>
                <input type="number" name="price" placeholder="请填写数字" />
              </div>
              <button className="fluid ui blue button" type="submit">添加</button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  renderAddPopup() {
    $('.add-record').modal('show');
  }

  renderSettingPopup() {
    $('.setting').modal('show');
  }
}

ReactDOM.render(<App />, document.getElementById('app'));

import React                from 'react';
import ReactDOM             from 'react-dom';
import low                  from 'lowdb';
import LocalStorage         from 'lowdb/adapters/LocalStorage';
import format               from 'date-fns/format';
import addHours             from 'date-fns/add_hours';
import zh                   from 'date-fns/locale/zh_cn';
import isPast               from 'date-fns/is_past';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import interval             from 'request-interval';

import 'semantic-ui-css/semantic.min.js';

require('semantic-ui-css/semantic.min.css');
require('./style.less');

const adapter = new LocalStorage('db');
const db = low(adapter);

db.defaults({ records: [], settings: [] }).write();


class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      records: [],
      newComputerNumValue: '',
      newPriceValue: '',
      price: 3
    }
  }

  render() {
    const {records, price} = this.state;
    return(
      <section className="home">
        <div className="ui fixed blue inverted menu">
          <a href="#" className="header item">
            汲爽计时系统
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
                <th>充值金额</th>
                <th>剩余时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {records.map((o, i) => {
                return(
                  <tr className={o.remainTime === 'end' ? 'negative' : ''} key={i}>
                    <td>{i + 1}</td>
                    <td>{o.computerNum}</td>
                    <td>{o.nowTime}</td>
                    <td>{o.endTime}</td>
                    <td>{o.price}元</td>
                    <td>{o.remainTime === 'end' ? '已到下机时间' : o.remainTime}</td>
                    <td>更新</td>
                 </tr>
                );
              })}
            </tbody>
          </table>
        </section>
        <div className="ui modal add-record">
          <i className="close icon"></i>
          <div className="ui center aligned grid header">添加上机记录</div>
          <div className="content">
            <form className="ui form" onSubmit={::this.submitAddRecordFrom}>
              <div className="field">
                <label>机器编号</label>
                <input type="number" name="computer-num" placeholder="请填写数字"
                  onChange={(event) => {this.setState({newComputerNumValue :event.target.value})}}
                />
              </div>
              <div className="field">
                <label>金额</label>
                <input type="number" name="price" placeholder="请填写数字"
                  onChange={(event) => {this.setState({newPriceValue: event.target.value})}}
                />
              </div>
              <button className="fluid ui blue button" type="submit">添加</button>
            </form>
          </div>
        </div>
        <div className="ui modal setting">
          <i className="close icon"></i>
          <div className="ui center aligned grid header">设置</div>
          <div className="content">
            <form className="ui form" onSubmit={::this.submitSettings}>
              <div className="field">
                <label>上机每小时价格</label>
                <input type="number" name="price" value={price} placeholder="请填写数字" />
              </div>
              <button className="fluid ui blue button" type="submit">更新</button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  componentDidMount() {
    const records = this.fetchData();
    this.fetchSettings();
    this.monitorRecords(records);
  }

  componentWillUnmount() {
    interval.clear(this.monitor);
  }

  renderAddPopup() {
    $('.add-record').modal('show');
  }

  renderSettingPopup() {
    $('.setting').modal('show');
  }

  submitAddRecordFrom(event) {
    event.preventDefault();
    const {newComputerNumValue, newPriceValue, price} = this.state;
    const now = Date.now();
    const endTime = addHours(now, Number((newPriceValue / price).toFixed(1)));
    db.get('records').push({
      computerNum: newComputerNumValue,
      price: newPriceValue,
      nowTime: format(now,'MMMD[日] HH:mm',{locale: zh}),
      endTime: format(endTime,'MMMD[日] HH:mm',{locale: zh}),
      endTimestamp: endTime,
      remainTime: isPast(endTime) ? 'end' : distanceInWordsToNow(endTime, {locale: zh})
    }).write();
    this.fetchData();
    $('.add-record').modal('hide');
  }

  submitSettings(event) {
    event.preventDefault();
    const {price} = this.state;
    db.get('settings').push({
      price
    }).write();
    this.fetchSettings();
    $('.setting').modal('hide');
  }

  fetchData() {
    const data = db.getState()
    const records = data && data.records;
    this.setState({records});
    return records;
  }

  fetchSettings() {
    const data = db.getState()
    const settings = data && data.settings;
    this.setState({settings});
  }

  monitorRecords(records) {
    this.monitor = interval(60000, () => {
        records = records.map(o => {
          o.remainTime = distanceInWordsToNow(o.endTimestamp, {locale: zh});
          if (isPast(o.endTimestamp)) {
            o.remainTime = 'end';
            db.get('records').find({ computerNum: o.computerNum }).assign({ remainTime: 'end'}).write();
            alert(`${o.computerNum}号机已到下机时间`);
          }
          return o;
          });
        this.setState({records});
    });
  }

}

ReactDOM.render(<App />, document.getElementById('app'));

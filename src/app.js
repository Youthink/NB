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
      remind: '',
      newComputerNumValue: '',
      newPriceValue: '',
      price: 3
    }
  }

  render() {
    const {records, price, remind} = this.state;
    return(
      <section className="home">
        <div className="ui fixed blue inverted menu">
          <a href="#" className="header item">
            汲爽计时系统
          </a>
          <div className="right menu">
            <a className="item" onClick={::this.renderAddPopup}>
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
                    <td>
                      <button className="ui mini red labeled icon button"
                        onClick={() => {
                          $('.update-record')
                          .modal('show');
                          this.setState({
                            updateComputerNum: o.computerNum,
                            updatePrice: o.price,
                            updateItem: i
                          });
                        }}
                      >
                        <i className="write icon"></i>更新
                      </button>
                      <button className="ui mini blue labeled icon button"
                        onClick={() => {
                        $('.delete-record')
                        .modal({
                          onApprove : () => {
                            db.get('records').remove({computerNum: o.computerNum}).write();
                            this.fetchData();
                          }
                        })
                        .modal('show');
                        }}
                      >
                        <i className="remove icon"></i>删除
                      </button>
                    </td>
                 </tr>
                );
              })}
            </tbody>
          </table>
        </section>
        <div className="ui tiny modal add-record">
          <i className="close icon"></i>
          <div className="ui center aligned grid header">添加上机记录</div>
          <div className="content">
            <form className="ui form error" onSubmit={::this.submitAddRecordFrom}>
              <div className="field">
                <label>机器编号</label>
                <input type="number" name="computer-num" placeholder="请填写数字"
                  value={this.state.newComputerNumValue}
                  onChange={(event) => {this.setState({newComputerNumValue :event.target.value})}}
                />
              </div>
              {remind &&
              <div className="ui error message">
                <div className="header">{remind}</div>
              </div>
              }
              <div className="field">
                <label>金额</label>
                <div class="ui right labeled input">
                  <input type="number" name="price" placeholder="请填写数字"
                    value={this.state.newPriceValue}
                    onChange={(event) => {this.setState({newPriceValue: event.target.value})}}
                  />
                  <div class="ui basic label">元</div>
                </div>
              </div>
              <button className="fluid ui blue button" type="submit">添加</button>
            </form>
          </div>
        </div>
        <div className="ui tiny modal update-record">
          <i className="close icon"></i>
          <div className="ui center aligned grid header">更新上机记录</div>
          <div className="content">
            <form className="ui form error" onSubmit={::this.submitUpdateRecordFrom}>
              <div className="field">
                <label>机器编号</label>
                <input disabled type="number" name="computer-num" placeholder="请填写数字"
                  value={this.state.updateComputerNum}
                />
              </div>
              <div className="field">
                <label>金额</label>
                <div class="ui right labeled input">
                  <input type="number" name="price" placeholder="请填写数字"
                    value={this.state.updatePrice}
                    onChange={(event) => {this.setState({updatePrice: event.target.value})}}
                  />
                  <div class="ui basic label">元</div>
                </div>
              </div>
              <button className="fluid ui blue button" type="submit">更新</button>
            </form>
          </div>
        </div>
        <div className="ui tiny modal setting">
          <i className="close icon"></i>
          <div className="ui center aligned grid header">设置</div>
          <div className="content">
            <form className="ui form" onSubmit={::this.submitSettings}>
              <div className="field">
                <label>上机每小时价格</label>
                <div class="ui right labeled input">
                  <input type="number" name="price" value={price} placeholder="请填写数字"
                    onChange={(event) => {this.setState({price: event.target.value})}}
                  />
                  <div class="ui basic label">元</div>
                </div>
              </div>
              <button className="fluid ui blue button" type="submit">更新</button>
            </form>
          </div>
        </div>
        <div className="ui mini modal delete-record">
          <div className="ui icon header">
            确认删除该记录？
          </div>
          <div className="actions" style={{textAlign: 'center'}}>
            <div className="ui green cancel button">
              <i className="checkmark icon"></i>
              不删除
            </div>
            <div className="ui red ok button">
              <i className="remove icon"></i>
              删除
            </div>
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
    requestTimeout.clear(this.rt);
  }

  renderAddPopup() {
    $('.add-record').modal('show');
  }

  renderSettingPopup() {
    $('.setting').modal('show');
  }

  submitUpdateRecordFrom(event) {
    event.preventDefault();
    const {updateComputerNum, updatePrice, price, updateItem} = this.state;
    const oldNow = db.get(`records[${updateItem}].nowTimestamp`).value();
    const endTime = addHours(oldNow, Number((updatePrice / price).toFixed(1)));
    db.get('records').find({computerNum: updateComputerNum}).assign({
      price: updatePrice,
      endTime: format(endTime,'MMMD[日] HH:mm',{locale: zh}),
      endTimestamp: endTime,
      remainTime: isPast(endTime) ? 'end' : distanceInWordsToNow(endTime, {locale: zh})
    }).write();
    this.fetchData();
    $('.update-record').modal('hide');
  }

  submitAddRecordFrom(event) {
    event.preventDefault();
    if (!this.verify()) {
      return;
    }
    const {newComputerNumValue, newPriceValue, price} = this.state;
    const now = Date.now();
    const endTime = addHours(now, Number((newPriceValue / price).toFixed(1)));
    db.get('records').push({
      computerNum: newComputerNumValue,
      price: newPriceValue,
      nowTime: format(now,'MMMD[日] HH:mm',{locale: zh}),
      endTime: format(endTime,'MMMD[日] HH:mm',{locale: zh}),
      endTimestamp: endTime,
      nowTimestamp: now,
      remainTime: isPast(endTime) ? 'end' : distanceInWordsToNow(endTime, {locale: zh})
    }).write();
    this.fetchData();
    this.setState({newComputerNumValue: '', newPriceValue: ''});
    $('.add-record').modal('hide');
  }

  verify() {
    const {newComputerNumValue, records} = this.state;
    const num = db.get('records').find({ computerNum: newComputerNumValue }).size().value();
    if (num > 0) {
      this.setState({remind: '该机器还未下机'});
      setTimeout(() => {
        this.setState({remind: ''});
      }, 1500);
      return false;
    }
    this.setState({remind: ''});
    return true;
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
    const interv = () => {
      records = records.map(o => {
        o.remainTime = distanceInWordsToNow(o.endTimestamp, {locale: zh});
        if (isPast(o.endTimestamp)) {
          o.remainTime = 'end';
          db.get('records').find({ computerNum: o.computerNum }).assign({ remainTime: 'end'}).write();
          //alert(`${o.computerNum}号机已到下机时间`);
        }
        return o;
      });
      this.setState({records});
    }
    interv();
    this.monitor = interval(60000, interv);
  }

}

ReactDOM.render(<App />, document.getElementById('app'));

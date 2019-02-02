import React               from 'react';
import ReactDOM            from 'react-dom';
import low                 from 'lowdb';
import LocalStorage        from 'lowdb/adapters/LocalStorage';
import format              from 'date-fns/format';
import addMinutes          from 'date-fns/add_minutes';
import zh                  from 'date-fns/locale/zh_cn';
import isPast              from 'date-fns/is_past';
import getTime             from 'date-fns/get_time';
import differenceInMinutes from 'date-fns/difference_in_minutes';
import interval            from 'request-interval';
import {
  Table,
  Button,
  Icon
} from 'antd';

import 'semantic-ui-css/semantic.min.js';

require('semantic-ui-css/semantic.min.css');
require('./style.less');

const adapter = new LocalStorage('db');
const db = low(adapter);

db.defaults(
    {
      records: [],
      settings: {
        price: 3
      }
    }
  ).write();


class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      records: [],
      remind: '',
      newComputerNumValue: '',
      newAmountValue: '',
      settings: {}
    }
  }

  render() {
    const {records, settings, remind} = this.state;
    const columns = [
      {
        title: '机器编号',
        dataIndex: 'computerNum',
        width: 110,
        align: 'center',
        sorter: (a, b) => a.computerNum - b.computerNum,
        sortDirections: ['descend', 'ascend'],
      }, {
        title: '上机时间',
        dataIndex: 'startTime',
        width: 120,
        align: 'center',
        defaultSortOrder: 'descend',
        sorter: (a, b) => a.startTime - b.startTime,
      }, {
        title: '下机时间',
        dataIndex: 'endTime',
        width: 120,
        align: 'center',
        sorter: (a, b) => a.endTime - b.endTime,
        sortDirections: ['descend', 'ascend'],
      }, {
        title: '充值',
        dataIndex: 'amount',
        width: 80,
        align: 'center',
        render: amount => amount + '元',
        sorter: (a, b) => a.amount - b.amount,
        sortDirections: ['descend', 'ascend']
      }, {
        title: '剩余时间',
        dataIndex: 'remainTime',
        width: 120,
        align: 'center',
        render: remainTime => remainTime === 'end' ? '已到下机时间' : remainTime,
        sorter: (a, b) => a.endTime - b.endTime,
        sortDirections: ['descend', 'ascend']
      }, {
        title: '余额',
        dataIndex: 'balance',
        width: 80,
        align: 'center',
        render: balance => balance + '元',
        sorter: (a, b) => a.endTime - b.endTime,
        sortDirections: ['descend', 'ascend']
      }, {
        title: '单价',
        dataIndex: 'price',
        width: 90,
        align: 'center',
        render: amount => amount + '元/小时'
      }, {
        title: '操作',
        align: 'center',
        render: (text, record, index) => (
          <React.Fragment>
            <Button
              type="primary"
              icon="edit"
              size="small"
              onClick={() => {
                $('.update-record')
                .modal('show');
                this.setState({
                  updateComputerNum: record.computerNum,
                  currentAmount: record.amount,
                  updateItem: index
                });
              }}
            >
              更新
            </Button>
            <Button
              type="danger"
              icon="delete"
              size="small"
              onClick={() => {
                $('.delete-record')
                .modal({
                  onApprove : () => {
                    db.get('records').remove({computerNum: record.computerNum}).write();
                    this.fetchData();
                  }
                })
                .modal('show');
              }}
            >
             删除
            </Button>
          </React.Fragment>
        )
      }
    ];

function onChange(pagination, filters, sorter) {
  console.log('params', pagination, filters, sorter);
}
    return(
      <section className="home">
        <div className="ui fixed blue inverted menu">
          <a href="#" className="header item">
            汲爽网咖计时系统
          </a>
          <div className="right menu">
            <a className="item" onClick={this.renderAddPopup}>
              <i className="plus icon"></i>
              上机
            </a>
            <a className="item" onClick={this.renderSettingPopup}>
              <i className="setting icon"></i>
              设置
            </a>
          </div>
        </div>
        <section className="ui container main">
          <div className="ui labeled button">
            <div className="ui blue button">
              <i className="user icon"></i> 目前上机人数
            </div>
            <a className="ui basic blue left pointing label">
              {records.length}
            </a>
          </div>
          <Table
            bordered
            pagination={false}
            columns={columns}
            dataSource={records}
            onChange={onChange}
            rowClassName={record => record.remainTime === 'end' && 'table-tr-end'}
          />
        </section>
        <div className="ui tiny modal add-record">
          <i className="close icon"></i>
          <div className="ui center aligned grid header">添加上机记录</div>
          <div className="content">
            <form className="ui form error" onSubmit={this.submitAddRecordFrom}>
              <div className="field">
                <label>机器编号</label>
                <input type="number" placeholder="填写机器编号" min="0"
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
                <div className="ui right labeled input">
                  <input type="number" placeholder="请填写数字" min="0" step="0.1"
                    value={this.state.newAmountValue}
                    onChange={(event) => {this.setState({newAmountValue: event.target.value})}}
                  />
                  <div className="ui basic label">元</div>
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
            <form className="ui form error" onSubmit={this.submitUpdateRecordFrom}>
              <div className="field">
                <label>机器编号</label>
                <div className="ui segment">
                  {this.state.updateComputerNum}
                </div>
              </div>
               <div className="field">
                <label>目前的金额</label>
                <div className="ui segment">
                  {this.state.currentAmount}
                </div>
              </div>
              <div className="field">
                <label>添加或减少的金额</label>
                <div className="ui right labeled input">
                  <input type="number" placeholder="请填写数字例如：5  或者 -5" step="0.1"
                    onChange={(event) => {this.setState({updateAmount: event.target.value})}}
                  />
                  <div className="ui basic label">元</div>
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
            <form className="ui form" onSubmit={this.submitSettings}>
              <div className="field">
                <label>上机每小时价格</label>
                <div className="ui right labeled input">
                  <input type="number" value={settings.price} placeholder="请填写数字" min="0" step="0.1"
                    onChange={(event) => {
                      const settings = {price: event.target.value};
                      this.setState({settings});
                    }}
                  />
                  <div className="ui basic label">元</div>
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
    this.fetchData();
    this.fetchSettings();
    this.monitorRecords();
  }

  componentWillUnmount() {
    interval.clear(this.monitor);
    requestTimeout.clear(this.rt);
  }

  renderAddPopup = () => {
    $('.add-record').modal('show');
  }

  renderSettingPopup() {
    $('.setting').modal('show');
  }

  submitUpdateRecordFrom = async (event) => {
    event.preventDefault();
    const {updateComputerNum, updateAmount, settings, updateItem} = this.state;
    const oldStartTime = db.get(`records[${updateItem}].startTimestamp`).value();
    const oldAmount = db.get(`records[${updateItem}].amount`).value();
    const balance = db.get(`records[${updateItem}].balance`).value() +  Number(updateAmount);
    const amount = Number(oldAmount) + Number(updateAmount);
    const endTime = getTime(format(addMinutes(oldStartTime, Number((amount * 60) / settings.price)), 'YYYY-MM-DDTHH:mm'));
    await db.get('records').find({computerNum: updateComputerNum}).assign({
      amount: amount,
      endTime: format(endTime,'MMMD[日] HH:mm',{locale: zh}),
      endTimestamp: endTime,
      remainTime: isPast(endTime) ? 'end' :  this.remainTime(endTime),
      balance: this.balance(amount, oldStartTime, settings.price)
    }).write();
    this.fetchData();
    $('.update-record').modal('hide');
  }

  submitAddRecordFrom = (event) => {
    event.preventDefault();
    if (!this.verify()) {
      return;
    }
    const {newComputerNumValue, newAmountValue, settings} = this.state;
    const now = Date.now();
    const endTime = getTime(format(addMinutes(now, Number((newAmountValue * 60) / settings.price)), 'YYYY-MM-DDTHH:mm'));
    const amount =  Number(newAmountValue);
    db.get('records').push({
      computerNum: newComputerNumValue,
      amount: amount,
      price: Number(settings.price),
      startTime: format(now,'MMMD[日] HH:mm',{locale: zh}),
      endTime: format(endTime,'MMMD[日] HH:mm',{locale: zh}),
      endTimestamp: endTime,
      startTimestamp: now,
      remainTime: isPast(endTime) ? 'end' :  this.remainTime(endTime),
      balance: this.balance(amount, now, settings.price)
    }).write();
    this.fetchData();
    this.setState({newComputerNumValue: '', newAmountValue: ''});
    $('.add-record').modal('hide');
  }

  verify() {
    const {newComputerNumValue, newAmountValue, records} = this.state;
    if (!newComputerNumValue || !newAmountValue) {
      this.setState({remind: '要填写完才能添加偶~'});
      return false;
    }
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

  submitSettings = (event) => {
    event.preventDefault();
    const price = Number(this.state.settings.price);
    db.get('settings').assign({price}).write();
    this.fetchSettings();
    $('.setting').modal('hide');
  }

  fetchData() {
    const data = db.getState()
    const records = data && data.records;
    this.setState({records});
  }

  fetchSettings() {
    const data = db.getState()
    const settings = data && data.settings;
    this.setState({settings});
  }

  monitorRecords() {
    const interv = () => {
      let {records} = db.getState();
      records = records.map(o => {
        o.remainTime = this.remainTime(o.endTimestamp);
        o.balance = this.balance(o.amount, o.startTimestamp, o.price);
        if (isPast(o.endTimestamp)) {
          o.remainTime = 'end';
          o.balance = 0;
          db.get('records').find({ computerNum: o.computerNum }).assign({ remainTime: 'end'}).write();
          //alert(`${o.computerNum}号机已到下机时间`);
        }
        return o;
      });
      this.setState({records});
    }
    interv();
    this.monitor = interval(6000, interv);
  }

  remainTime(endTimestamp) {
    const minutes = differenceInMinutes(endTimestamp, Date.now());
    const h = Math.floor(minutes / 60);
    const m = minutes - h * 60 + 1;
    if (h > 0) {
      return h + '小时' + m + '分钟';
    }
    return m + '分钟';
  }

  balance(amount, startTimestamp, price) {
    let balance;
    const pricePerHour = 60 / price;
    const expendMinutes = Math.abs(Number(differenceInMinutes(Date.now(), startTimestamp)));
    if (expendMinutes <= pricePerHour) {
      balance = amount - 1;
      return balance;
    }
    balance = (amount * 10 - (Number(((expendMinutes / 60)  * price).toFixed(1)) * 10)) / 10;
    let integer = Number((balance + "").split(".")[0]);
    const newDecimal = 0;
    balance = integer + newDecimal * 0.1;
    return balance <= 0 ? 0 : balance;
  }

}

ReactDOM.render(<App />, document.getElementById('app'));

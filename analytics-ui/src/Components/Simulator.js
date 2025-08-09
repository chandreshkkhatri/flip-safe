import React, { Component } from "react";
import M from "materialize-css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRandom, faChartBar, faAngleDoubleDown, faBroom, faAngleRight, faSync } from "@fortawesome/free-solid-svg-icons";
import { TypeChooser } from "react-stockcharts/lib/helper";
import Hotkeys from "react-hot-keys";

import { prepareMarketData, toKiteDateFormat, getWeekDay, } from "../utils/simulation-module";
import { getMWInstruments } from "../utils/db-queries";
import { getChartData, requestSimulationInstrumentData, flushSimulationDataFromServer } from "../utils/kc-queries"

import Chart from "./ui-components/Charts/Chart";
import Ticker from "./ui-components/Ticker"

class Simulator extends Component {
  constructor() {
    super();
    let simulation_date = new Date();
    let simulationData = []
    let cached_data = JSON.parse(localStorage.getItem('simulationData'))
    if (cached_data) {
      simulationData = cached_data
    }
    let cached_date = Number(localStorage.getItem("sim_date"));
    if (cached_date) {
      simulation_date = new Date(cached_date);
    }
    let period = Number(localStorage.getItem('period'))
    let interval = JSON.parse(localStorage.getItem('interval'))
    let max_period = Number(localStorage.getItem('max_period'))
    if (!period) { period = 30 }
    if (!max_period) { max_period = 180 }
    if (!interval) { interval = { label: '15 min', value: '15minute' } }
    let timeIndex = Math.floor(((simulation_date.getTime() % 86400000) - 12600000))
    let timeDivider = 0
    if (timeIndex > 0 && timeIndex < 23400000) {
      timeDivider = Math.floor(timeIndex / 234000)
    }
    // console.log(simulation_date.getTime() % 86400000)
    this.state = {
      timeDivider,
      interval,
      simulation_date,
      chartData: [],
      period,
      max_period,
      simulationDataBeingPrepared: false,
      simulationData,
      simulatorFormInstrument: JSON.parse(localStorage.getItem("chartInstrument"))
    };
  }
  componentDidMount() {
    M.AutoInit();
    if (this.state.simulatorFormInstrument) {
      // this.requestChartData()
    }
  }
  flushSimulationData = simulation_date => {
    flushSimulationDataFromServer()
    let simulationData = this.state.simulationData
    localStorage.setItem('simulationData', null)
    this.setState({ simulationData })
  };
  getSimulationData = async () => {
    this.setState({ simulationDataBeingPrepared: true });
    let mwName = this.refs.ticker.getActiveMW();
    let _date = this.state.simulation_date;
    let simulation_date = toKiteDateFormat(_date).substr(0, 10);
    let interval = "minute";
    let instrumentList = await getMWInstruments(mwName);
    let simulationData = this.state.simulationData;
    for (let it in instrumentList) {
      let dataNotPresent = true
      let instrument_token = instrumentList[it].instrument_token
      for (let jt in simulationData) {
        if (instrument_token === simulationData[jt].instrument_token) {
          console.log('match')
          dataNotPresent = false
        }
      }
      if (dataNotPresent) {
        requestSimulationInstrumentData(instrument_token, simulation_date, interval)
          .then((res) => {
            if (res.data.status) {
              let data = res.data.data;
              simulationData.push({
                instrument_token,
                data,
                status: true
              });
              this.setState({ simulationData })
              localStorage.setItem('simulationData', JSON.stringify(simulationData))
            }
          })
          .catch((err) => {
            console.log("error getting data from server", err);
          });
      }
    }

    this.setState({ simulationData, simulationDataBeingPrepared: false });
  };
  requestChartData = () => {
    let oneDayInterval = 86400;
    let instrument_token = this.state.simulatorFormInstrument.instrument_token;
    let { interval, period, simulation_date } = this.state;
    let to_date = `${simulation_date.toISOString().substr(0, 10)} 23:59:00`
    let dateStamp = simulation_date.getTime();
    let _from_date = new Date(dateStamp - period * oneDayInterval * 1000);
    let from_date = toKiteDateFormat(_from_date).substr(0, 19);
    let payload = { instrument_token, interval: interval.value, from_date, to_date };
    this.getChartData(payload)
  }
  getChartData = (payload) => {
    let simulation_date = this.state.simulation_date
    getChartData(payload)
      .then(res => {
        let chartData = [];
        let _data = res.data;
        let presentDayCandleCounter = 0;
        if (typeof _data === "object" && _data.length !== 0) {
          for (let it in _data) {
            // console.log(date.toISOString().substr(0, 10), new Date(_data[it]["date"]).toISOString().substr(0, 10))
            if (new Date(_data[it]["date"]).toISOString().substr(0, 10) === simulation_date.toISOString().substr(0, 10)) {
              presentDayCandleCounter++;
            }
          }
          let open_price
          try { open_price = _data[_data.length - presentDayCandleCounter - 1]["close"] / 100; }
          catch (e) { console.log(e) }
          for (let it in _data) {
            let tmp = {};
            tmp.date = new Date(_data[it]["date"]);
            tmp.open = _data[it]["open"] / open_price;
            tmp.high = _data[it]["high"] / open_price;
            tmp.low = _data[it]["low"] / open_price;
            tmp.close = _data[it]["close"] / open_price;
            tmp.volume = _data[it]["volume"];
            chartData.push(tmp);
          }
          let timeIndex = Math.floor(((simulation_date.getTime() % 86400000) - 12600000))
          let timeDivider = 0
          if (timeIndex > 0 && timeIndex < 23400000) {
            timeDivider = Math.floor(timeIndex / 234000)
          }
          this.setState({ simulation_date, timeDivider });
          this.setState({ timeDivider, chartData, presentDayCandleCounter });
        } else {
          this.setState({ chartData: [] });
        }
      });
  };
  handleTimeSlider = e => {
    this.setState({ timeDivider: e.target.value });
  };
  handleRowSelect = async instrument => {
    // localStorage.setItem("chartInstrument", JSON.stringify(instrument));
    await this.setState({ simulatorFormInstrument: instrument });
    this.requestChartData()
  };
  handleDateChange = e => {
    let simulation_date = new Date(e.target.value);
    simulation_date.setHours(9, 0, 0, 0)
    let cached_date = simulation_date.getTime()
    console.log(cached_date)
    localStorage.setItem("sim_date", cached_date);
    this.setState({ simulation_date });
  };
  handleIntervalChange = async e => {
    let interval = { value: e.target.value };
    let { period, max_period } = this.state;
    switch (interval.value) {
      case "minute":
        period = 2;
        max_period = 30
        break;
      case "3minute":
        period = 2;
        max_period = 90
        break;
      case "5minute":
        max_period = 90
        period = 7;
        break;
      case "10minute":
        max_period = 90
        period = 14;
        break;
      case "15minute":
        max_period = 180
        period = 30;
        break;
      case "30minute":
        max_period = 180
        period = 60;
        break;
      case "60minute":
        max_period = 365
        period = 90;
        break;
      case "day":
        max_period = 2000
        period = 1000;
        break;
      default:
    }
    localStorage.setItem('interval', JSON.stringify(interval))
    localStorage.setItem('period', period)
    localStorage.setItem('max_period', max_period)
    await this.setState({ interval, period, max_period });
    this.requestChartData()
  };
  handlePeriodChange = e => { this.setState({ period: e.target.value }); };
  updateListOfMW = () => { this.refs.ticker.getAllmwInfo(); };
  onKeyDown = (keyName, e, handle) => {
    if (keyName === "shift+right") {
      let simulation_date = new Date(this.state.simulation_date.getTime() + 60000);
      this.setState({ simulation_date });
    }
    if (keyName === "shift+left") {
      let simulation_date = new Date(this.state.simulation_date.getTime() - 60000);
      this.setState({ simulation_date });
    }
    if (keyName === "ctrl+up") {
      let simulation_date = new Date(this.state.simulation_date.getTime() + 5 * 60000);
      this.setState({ simulation_date });
    }
    if (keyName === "ctrl+down") {
      let simulation_date = new Date(this.state.simulation_date.getTime() - 5 * 60000);
      this.setState({ simulation_date });
    }
    if (keyName === "ctrl+right") {
      let simulation_date = new Date(this.state.simulation_date.getTime() + 15 * 60000);
      this.setState({ simulation_date });
    }
    if (keyName === "ctrl+left") {
      let simulation_date = new Date(this.state.simulation_date.getTime() - 15 * 60000);
      this.setState({ simulation_date });
    }
  };
  randomizeInput = () => {
    let baseDate = 1388534400;
    let oneDayInterval = 86400;
    let day = 100
    let dateStamp
    let simulation_date
    while (day > 5 || day < 1) {
      dateStamp = (Math.floor(Math.random() * 1825) * oneDayInterval + baseDate) * 1000;
      simulation_date = new Date(dateStamp);
      day = simulation_date.getDay()
    }
    this.flushSimulationData()
    simulation_date.setHours(9, 0, 0, 0);
    localStorage.setItem("sim_date", simulation_date.getTime());
    this.setState({ simulation_date, simulationData: [] });
  };
  getNextDay = () => { console.log('under construction') }

  render() {
    let candleStickChart = <div>Loading...</div>;
    let { chartData, timeDivider, presentDayCandleCounter, simulatorFormInstrument, simulation_date, interval, simulationData, period } = this.state;
    let marketData = {};
    if (simulationData) {
      marketData = prepareMarketData(simulationData, simulation_date);
    }
    let disableGetChartBtn = true;
    let chartDataRendered = [];
    if (simulatorFormInstrument) {
      disableGetChartBtn = false;
    }
    if (chartData.length === 0) {
      candleStickChart = <div>No Data Points to display</div>;
    } else {
      for (let it = 0; it < chartData.length; it++) {
        if (it < chartData.length + presentDayCandleCounter * (timeDivider / 100 - 1)) {
          chartDataRendered.push(chartData[it]);
        } else {
          chartDataRendered.push({
            date: chartData[it]["date"],
            open: 100,
            high: 100,
            low: 100,
            close: 100,
            // volume: 100
          });
        }
      }
      candleStickChart = (
        <TypeChooser>
          {type => <Chart type={type} data={chartDataRendered} />}
        </TypeChooser>
      );
    }

    return (
      <div className="route-container">
        <div className="row no-margin">
          <div className="col s8 no-padding">
            <div />
            <h2 style={{ marginLeft: "10px" }}>Simulator</h2>
            <div className="divider" />
            <br />
            <div className="row no-margin">
              <div className="col s2 no-padding">
                <div className="row no-margin">
                  <div className="col s7">
                    <label>Instrument:</label>
                  </div>
                  <div className="col s12">
                    {simulatorFormInstrument
                      ? `${simulatorFormInstrument.tradingsymbol}`
                      : `NA`}
                  </div>
                </div>
                <div className="row no-margin">
                  <div className="col s8">
                    <label>Exchange:</label>
                  </div>
                  <div className="col s12">
                    {simulatorFormInstrument
                      ? ` ${simulatorFormInstrument.exchange}`
                      : `NA`}
                  </div>
                </div>
                <br />
                <div className="row no-margin">
                  <div className="col s12">
                    <label>Interval:</label>
                  </div>
                  <div className="col s12">
                    <select value={interval.value} style={{ width: "77px" }} onChange={this.handleIntervalChange} className="browser-default">
                      <option className="browser-default" value="minute">1 min</option>
                      <option className="browser-default" value="3minute">3 min</option>
                      <option className="browser-default" value="5minute">5 min</option>
                      <option className="browser-default" value="10minute">10 min</option>
                      <option className="browser-default" value="15minute">15 min</option>
                      <option className="browser-default" value="30minute">30 min</option>
                      <option className="browser-default" value="60minute">1 hr</option>
                      <option className="browser-default" value="day">1 day</option>
                    </select>
                  </div>
                  <div className="col s12">
                    <label>Period (days):</label>
                  </div>
                  <div className="col s12">
                    <input type="number" style={{ width: "77px" }} min="1" max="2000" className="browser-default" value={`${period}`} onChange={this.handlePeriodChange} />
                  </div>
                </div>
                <div className="row no-margin">
                  <div className="col s12">
                    <label>Date</label>
                  </div>
                  <div className="col">
                    <input type="date" value={simulation_date.toISOString().substr(0, 10)} className="browser-default" onChange={this.handleDateChange} />
                  </div>
                  <div className="col s12">
                    <label>Simulator Time:</label>
                  </div>
                  <div className="col s12">
                    <input type="text" value={`${toKiteDateFormat(simulation_date).substr(11, 8)} ${getWeekDay(simulation_date.getDay())}`} readOnly className="browser-default" />
                  </div>
                  <div className="col">
                    <button className="btn-small" style={{ margin: "10px 3px 0 0" }} title="Randomize" onClick={this.randomizeInput}>
                      <FontAwesomeIcon icon={faRandom} />
                    </button>
                    <button className="btn-small" style={{ margin: "10px 3px 0 0" }} title="Get simulation data" onClick={this.getSimulationData}>
                      <FontAwesomeIcon icon={faAngleDoubleDown} />
                    </button>
                    <button className="btn-small" style={{ margin: "10px 3px 0 0" }} title="Flush simulation data" onClick={this.flushSimulationData}>
                      <FontAwesomeIcon icon={faBroom} />
                    </button>
                    <button className="btn-small" style={{ margin: "10px 10px 0 0" }} title="Get next day's chart" onClick={this.requestChartData} disabled={disableGetChartBtn}>
                      <FontAwesomeIcon icon={faSync} />
                    </button>
                    <button className="btn-small" style={{ margin: "10px 10px 0 0" }} title="Get next day's chart" onClick={this.getNextDay} disabled={disableGetChartBtn}>
                      <FontAwesomeIcon icon={faChartBar} /> &nbsp; <FontAwesomeIcon icon={faAngleRight} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="col s10">
                <div className="chart-canvas">{candleStickChart}</div>
                <div className="time-divider">
                  <input type="range" value={timeDivider}
                    onChange={this.handleTimeSlider}
                    name="points" min="0" max="100" />
                </div>
              </div>
            </div>
          </div>
          <Ticker ref="ticker" marketData={marketData} updateListOfMW={this.updateListOfMW} onRowSelect={this.handleRowSelect}></Ticker>
        </div>
        <Hotkeys keyName="ctrl+left,ctrl+right,ctrl+down,ctrl+up,shift+left,shift+right" onKeyDown={this.onKeyDown.bind(this)} />
      </div>
    );
  }
}

export default Simulator;

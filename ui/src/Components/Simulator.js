import React, { Component } from "react";
import M from "materialize-css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar, faAngleDoubleDown, faBroom, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { TypeChooser } from "react-stockcharts/lib/helper";
import Hotkeys from "react-hot-keys";

import { prepareMarketData, toKiteDateFormat, getWeekDay, } from "../utils/simulation-module";
import { getMWInstruments } from "../utils/db-queries";
import { getChartData, requestSimulationInstrumentData, flushSimulationDataFromServer } from "../utils/kc-queries"

import Chart from "./Terminal/Chart";
import Ticker from "./Terminal/Ticker/Ticker"

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
    setTimeout(() => {
      this.setState({ simulationDataBeingPrepared: false });
    }, 2000);
  };

  requestChartData = async () => {
    if (this.state.simulatorFormInstrument) {
      let instrument_token = this.state.simulatorFormInstrument.instrument_token;
      let to_date = toKiteDateFormat(this.state.simulation_date);
      let to = new Date(this.state.simulation_date);
      to.setDate(to.getDate() - this.state.period);
      let from_date = toKiteDateFormat(to);
      let interval = this.state.interval.value;
      let chartData = await getChartData(instrument_token, from_date, to_date, interval);
      this.setState({ chartData });
    }
  };

  handleChange = () => {
    let simulation_date = new Date(this.refs.date.value);
    localStorage.setItem("sim_date", simulation_date.getTime());
    this.setState({ simulation_date });
    let timeIndex = Math.floor(((simulation_date.getTime() % 86400000) - 12600000))
    let timeDivider = 0
    if (timeIndex > 0 && timeIndex < 23400000) {
      timeDivider = Math.floor(timeIndex / 234000)
    }
    this.setState({ timeDivider })
  };

  simulatorCallback = data => {
    this.setState({ simulatorFormInstrument: data.selectedInstrument });
    localStorage.setItem("chartInstrument", JSON.stringify(data.selectedInstrument));
  };

  onKeyDown(keyName, e, handle) {
    if (keyName === "alt+d") {
      this.nextDay();
    }
    if (keyName === "alt+s") {
      this.previousDay();
    }
  }

  nextDay = () => {
    let simulation_date = new Date(this.state.simulation_date);
    simulation_date.setDate(simulation_date.getDate() + 1);
    localStorage.setItem("sim_date", simulation_date.getTime());
    this.setState({ simulation_date });
  };

  previousDay = () => {
    let simulation_date = new Date(this.state.simulation_date);
    simulation_date.setDate(simulation_date.getDate() - 1);
    localStorage.setItem("sim_date", simulation_date.getTime());
    this.setState({ simulation_date });
  };

  setSlider = e => {
    let timeDivider = e.target.value
    this.setState({ timeDivider })
  }

  render() {
    let chartData = prepareMarketData(this.state.simulationData, this.state.simulatorFormInstrument, this.state.timeDivider)
    return (
      <Hotkeys keyName="alt+d,alt+s" onKeyDown={this.onKeyDown.bind(this)}>
        <div className="simulator-panel">
          <div className="market-data-panel">
            <Ticker
              simulatorCallback={this.simulatorCallback}
              ref="ticker"
              simulation_date={this.state.simulation_date}
              timeDivider={this.state.timeDivider}
              simulationData={this.state.simulationData}
            />
          </div>
          <div className="chart-panel">
            <div className="chart-options-bar">
              <div className="chart-instrument-name">
                {this.state.simulatorFormInstrument ? this.state.simulatorFormInstrument.tradingsymbol : "Select Instrument"}
              </div>
              <div className="chart-date-picker">
                <FontAwesomeIcon icon={faAngleRight} onClick={this.previousDay} />
                <input type="date" ref="date" value={toKiteDateFormat(this.state.simulation_date).substr(0, 10)} onChange={this.handleChange} />
                <span className="weekDay">{getWeekDay(this.state.simulation_date)}</span>
                <FontAwesomeIcon icon={faAngleRight} onClick={this.nextDay} />
              </div>
              <div className="chart-actions">
                <button onClick={this.getSimulationData} disabled={this.state.simulationDataBeingPrepared}>
                  <FontAwesomeIcon icon={faAngleDoubleDown} />
                  {this.state.simulationDataBeingPrepared ? "Loading" : "Load Data"}
                </button>
                <button onClick={this.flushSimulationData}>
                  <FontAwesomeIcon icon={faBroom} />
                  Flush Data
                </button>
                <button onClick={this.requestChartData}>
                  <FontAwesomeIcon icon={faChartBar} />
                  Load Chart
                </button>
              </div>
              <div className="time-slider">
                <input type="range" min="0" max="100" value={this.state.timeDivider} onChange={this.setSlider} />
                <span>{Math.floor(this.state.timeDivider)}%</span>
              </div>
            </div>
            <div className="chart-container">
              {chartData.length > 0 && (
                <TypeChooser>
                  {type => <Chart type={type} data={chartData} />}
                </TypeChooser>
              )}
            </div>
          </div>
        </div>
      </Hotkeys>
    );
  }
}

export default Simulator;
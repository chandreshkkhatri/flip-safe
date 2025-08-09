import React, { Component } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt, faBell } from "@fortawesome/free-solid-svg-icons";
import { TypeChooser } from "react-stockcharts/lib/helper";
import RouteContainer from "../layout/RouteContainer";
import * as commonHelper from '../../helpers/common'
import * as kcHelper from '../../helpers/api/kc';
import Chart from "./Chart";

const intervalArray = [
    { label: '1 min', value: 'minute' },
    { label: '3 min', value: '3minute' },
    { label: '5 min', value: '5minute' },
    { label: '10 min', value: '10minute' },
    { label: '15 min', value: '15minute' },
    { label: '30 min', value: '30minute' },
    { label: '1Hr', value: '60minute' },
    { label: '1D', value: 'day' },
]

const returnFromDate = (period) => {
    const to_date = new Date()
    to_date.setHours(23, 59, 0, 0);
    const oneDayInterval = 86400;
    const from_date = new Date(to_date.getTime() - period * oneDayInterval * 1000)
    return commonHelper.toKiteDateFormat(from_date).substr(0, 19)
}
const returnToDate = () => {
    const to_date = new Date()
    to_date.setHours(23, 59, 0, 0);
    return commonHelper.toKiteDateFormat(to_date).substr(0, 19)
}

class TradeView extends Component {
    constructor() {
        super()
        let chartMetaData = JSON.parse(localStorage.getItem('chartMetaData'))
        let chartData = []
        if (!chartMetaData) { chartMetaData = [] }
        for (let it = 0; it < chartMetaData.length; ++it) {
            chartData.push([])
        }

        this.state = {
            chartData: [],
            chartMetaData,
            networkError: false,
        }
    }
    componentDidMount() {
        if (this.props.chartInstrument) {
            for (let it = 0; it < this.state.chartMetaData.length; ++it) {
                this.makeChartRequest(it, this.props.chartInstrument)
            }
        }
    }
    componentDidUpdate() {
        if (this.props.chartInstrument) {
            if (this.props.chartInstrument.instrument_token !== this.last_instrument_token) {
                for (let it = 0; it < this.state.chartMetaData.length; ++it) {
                    this.makeChartRequest(it, this.props.chartInstrument)
                }
                this.last_instrument_token = this.props.chartInstrument.instrument_token
            }
        }
    }
    makeChartRequest = (index, instrument) => {
        const { chartMetaData } = this.state
        const { interval, period } = chartMetaData[index]
        const from_date = returnFromDate(period)
        const to_date = returnToDate()
        const instrument_token = instrument.instrument_token
        this.getChartData(instrument_token, interval.value, from_date, to_date, index)
    }
    handleIntervalChange = async (e, key) => {
        let interval
        for (let it in intervalArray) {
            if (intervalArray[it].value === e.target.value) {
                interval = intervalArray[it]
            }
        }
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
        let chartMetaData = JSON.parse(localStorage.getItem('chartMetaData'))
        chartMetaData[key] = { interval, period, max_period }
        this.setState(chartMetaData);
        localStorage.setItem('chartMetaData', JSON.stringify(chartMetaData))
        const from_date = returnFromDate(period)
        const to_date = returnToDate()
        this.getChartData(this.props.chartInstrument.instrument_token, interval.value, from_date, to_date, key)
    };
    handlePeriodChange = e => {
        this.setState({ period: e.target.value });
    };

    getChartData = (instrument_token, interval, from_date, to_date, index) => {
        const payload = { instrument_token, interval, from_date, to_date };
        let { chartData } = this.state;

        kcHelper.getHistoricalData(payload, index, chartData, (networkError, chartData = null) => {
            if (networkError) {
                this.setState({ networkError })
            }
            else {
                this.setState({ chartData, networkError });
            }
        })
    }
    handleChartCountChange = (e) => {
        let noOfCharts = e.target.value
        let { chartMetaData, chartData } = this.state
        if (chartMetaData.length < noOfCharts) {
            chartMetaData.push({
                interval: { label: '15 min', value: '15minute' },
                period: 30,
                max_period: 180
            })
            chartData.push([])
        }
        if (chartMetaData.length > noOfCharts) {
            chartMetaData.pop()
            chartData.pop()
        }
        this.setState({ chartMetaData, chartData })
        localStorage.setItem('chartMetaData', JSON.stringify(chartMetaData))
    }
    prepareOrder = (type, windowType) => {
        this.props.prepareOrder(type, this.props.chartInstrument, windowType)
    }
    createAlert = (e) => {
        this.props.createAlert(this.props.chartInstrument)
    }

    render() {
        let candleStickChart = []
        // <div>Loading...</div>;
        let { chartData, chartMetaData, networkError } = this.state
        let { chartInstrument, nightMode } = this.props
        let textColor
        // appBackgroundColor
        if (nightMode) {
            // appBackgroundColor = "blue-grey darken-4"
            textColor = "cyan-text"
        } else {
            // appBackgroundColor = "white"
            textColor = "black-text"
        }
        for (let it in chartData) {
            if (chartData[it].length === 0) {
                candleStickChart.push(<div>No Data Points to display</div>)
            } else {
                candleStickChart.push(
                    <TypeChooser>
                        {type => <Chart nightMode={nightMode} type={type} data={chartData[it]} />}
                    </TypeChooser>
                );
            }
        }
        let title = `${chartInstrument.tradingsymbol} | ${chartInstrument.name}`

        return (<RouteContainer title={title} networkError={networkError}>
            {chartInstrument ? <div>
                <div className="row">
                    <div className="col s1">
                        <label>No of Charts</label>
                        <input type="number" name="points" step="1" value={chartMetaData.length} className={`${textColor}`} onChange={this.handleChartCountChange} />
                    </div>
                    <button className="btn-small" onClick={() => this.prepareOrder('buy', 'entry')}>B</button>&nbsp;
                            <button className="btn-small red" onClick={() => this.prepareOrder('sell', 'entry')}>S</button>&nbsp;
                            <button className="btn-small" title="create alert" onClick={this.createAlert}>
                        <FontAwesomeIcon size="sm" icon={faBell}></FontAwesomeIcon></button>&nbsp;
                        </div>
                {chartMetaData.map((object, index) => <div key={index} className="row no-margin">
                    <div className="col chart-canvas s11">
                        {candleStickChart[index]}
                    </div>
                    <div className="col s1">
                        <div className="col"><button onClick={(e) => this.makeChartRequest(index, chartInstrument)} className="btn-small"><FontAwesomeIcon icon={faSyncAlt} /></button></div>
                        <div className="col">
                            <label htmlFor="chart_period">Period (days):</label><br />
                            <input id="chart_period" name="chart_period" type="number" style={{ width: "77px", padding: '12px', border: '1px solid' }} className="browser-default" min="1" max={object.max_period} value={`${object.period}`} onChange={this.handlePeriodChange} />
                        </div>
                        <div className="col">
                            <label htmlFor="chart_interval">Interval:</label><br />
                            <select id="chart_interval" name="chart_interval" style={{ display: 'block', border: '1px solid' }} className="browser-default" value={object.interval.value} onChange={(e) => this.handleIntervalChange(e, index)}>
                                {intervalArray.map((object, index) => <option key={index} value={object.value}>{object.label}</option>)}
                            </select>
                        </div>
                    </div>
                </div>)}
                {/* {chartsCanvasArray} */}
            </div> : <div> No Instrument Selected</div>}
        </RouteContainer>
        )
    }
}

export default TradeView


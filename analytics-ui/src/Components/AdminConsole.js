import React, { Component } from 'react'
import axios from 'axios'
import M from 'materialize-css'
import SearchInstrument from './ui-components/SearchInstrument'
import Select from 'react-select';

let customStyles = {
    input: () => ({ height: '34px', }),
}

class AdminConsole extends Component {
    componentDidMount() {
        M.AutoInit()
    }
    state = {
        interval: { label: '10minute', value: '10minute' },
        selectedSection: 'tickerSection',
        tickerMWData: [],
        from_date: '2017-02-05 00:00:00',
        to_date: '2017-05-05 23:59:00'
    }
    gettickerMWData = (selectedTicker) => {
        let tickerId = selectedTicker.value
        axios.get(`http://localhost:3000/db/get-ticker-instruments?tickerId=${tickerId}`)
            .then((res) => this.setState({ tickerMWData: res.data }))
            .catch((err) => console.log(err))
    }
    handleInstrumentSelect = (selectedInstrument) => {
        this.setState({ selectedInstrument })
    }
    handleCacheRequest = () => {
        if (this.state.selectedSection === 'instrumentSection') {
            let selectedInstrument = this.state.selectedInstrument
            if (selectedInstrument) {
                let from_date = this.state.from_date
                let to_date = this.state.to_date
                let instrument_token = selectedInstrument.instrument_token
                let interval = this.state.interval.value
                let payload = { instrument_token, interval, from_date, to_date }
                axios.post('http://localhost:3000/db/cache-data', payload)
                    .then((res) => console.log(res.data))
                    .catch((err) => console.log(err))
            } else {
                M.toast({ html: 'No instrument selected' })
            }
        } else {
            let { tickerMWData, tickerId } = this.state
            if (tickerId) {
                let from_date = this.state.from_date
                let to_date = this.state.to_date
                let instrumentList = tickerMWData
                let interval = this.state.interval.value
                let payload = []
                for (let it in instrumentList) {
                    payload.push({ instrument_token: instrumentList[it]['instrument_token'], interval, from_date, to_date })
                }
                let t = 0
                let id = setInterval(() => {
                    axios.post('http://localhost:3000/db/cache-data', payload[t])
                        .then((res) => console.log(res.data))
                        .catch((err) => console.log(err))
                    t++
                    if (t > payload.length - 1) {
                        clearInterval(id)
                    }
                }, 800)
            } else {
                M.toast({ html: 'No List selected' })
            }

        }
    }
    clearCacheStack = () => {
        axios.get('http://localhost:3000/db/clear-pending-cache-stack')
            .then((res) => M.toast({ html: res.data }))
            .catch((err) => console.log('error requesting cache stack clearance'))
    }
    flushCacheStack = () => {
        axios.get('http://localhost:3000/db/flush-cache-stack')
            .then((res) => M.toast({ html: res.data }))
            .catch((err) => console.log('error requesting cache stack clearance'))
    }
    intervalOptions = [
        { label: '1minute', value: 'minute' },
        { label: '3minute', value: '3minute' },
        { label: '5minute', value: '5minute' },
        { label: '10minute', value: '10minute' },
        { label: '15minute', value: '15minute' },
        { label: '30minute', value: '30minute' },
        { label: '1hr', value: '60minute' },
        { label: '1day', value: 'day' },
    ]
    tickerIdOptions = [
        { label: 'Ticker 0', value: 'ticker0' },
        { label: 'Ticker 1', value: 'ticker1' },
        { label: 'Ticker 2', value: 'ticker2' },
    ]
    pad = (number) => {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }

    toDateTimeLocal = (_date) => {
        let date
        try {
            date = _date.getFullYear() +
                '-' + this.pad(_date.getMonth() + 1) +
                '-' + this.pad(_date.getDate()) +
                'T' + this.pad(_date.getHours()) +
                ':' + this.pad(_date.getMinutes()) +
                ':' + this.pad(_date.getSeconds());
        }
        catch (e) { console.log(e, '/n skipped converstion') }
        return date
    }

    updateInstruementsDB = () => {
        let updateInstruementsDB = window.confirm('Are you sure you want to update the Instrument DB?')
        if (updateInstruementsDB) {
            console.log(updateInstruementsDB)
            axios.get('http://localhost:3000/db/update-instruments-db')
                .then((res) => console.log(res))
                .catch((err) => console.log(err))
        } else {
            console.log('declined')
        }
    }
    syncMWWithInstrumentDB = () => {
        window.alert('under construction')
    }
    render() {
        let { selectedSection, interval, selectedInstrument, tickerId, from_date, to_date } = this.state
        let { tickerIdOptions } = this
        let tickerCount = this.state.tickerMWData.length
        var date1 = new Date(from_date);
        var date2 = new Date(to_date);
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

        let tickerSectionOpacity = '1'
        let instrumentSectionOpacity = '0.3'
        if (selectedSection === 'instrumentSection') {
            tickerSectionOpacity = '.3'
            instrumentSectionOpacity = '1'
        }
        return (<div className="route-container">
            <h2 style={{ margin: '20px' }}>Administrative Section!</h2>
            <div className="divider"></div><br />
            <div className="row no-margin">
                <div className="col s6">
                    <div className="row no-margin no-padding">
                        <div className="col">
                            <h4>Historical Data Cacher</h4>
                        </div>
                    </div>
                    <div className="divider"></div><br />
                    <div className="row no-margin" onClick={() => this.setState({ selectedSection: 'instrumentSection' })}>
                        <div className="col s12 no-margin no-padding" style={{ opacity: instrumentSectionOpacity }} >
                            <div className="row no-margin">
                                <div className="col s6">
                                    <SearchInstrument tabIndex={["1", "2"]} onInstrumentSelect={this.handleInstrumentSelect}></SearchInstrument>
                                </div>
                            </div><br />

                            <div className="row no-margin">
                                <div className="col s3">
                                    Instrument Token: {selectedInstrument ? `${selectedInstrument.instrument_token}`
                                        : 'NA'}
                                </div>
                                <div className="col s3">
                                    Trading Symbol: {selectedInstrument ? `${selectedInstrument.tradingsymbol}`
                                        : 'NA'}
                                </div>
                                <div className="col s3">
                                    Exchange: {selectedInstrument ? `${selectedInstrument.exchange}`
                                        : 'NA'}
                                </div>
                                <br />
                            </div>
                        </div>
                    </div><br />
                    <div className="divider"></div><br />

                    <div className="row no-margin" style={{ opacity: tickerSectionOpacity }} onClick={() => this.setState({ selectedSection: 'tickerSection' })}>
                        <div className="col s12 no-margin no-padding">
                            <div className="row no-margin">
                                <div className="col s3">
                                    <Select value={tickerId}
                                        tabIndex="4"
                                        onChange={(value) => {
                                            this.setState({ tickerId: value })
                                            this.gettickerMWData(value)
                                        }}
                                        styles={customStyles}
                                        options={tickerIdOptions}
                                        placeholder="&#xf0b0; &nbsp; Select list"
                                        className="fontAwesome" />
                                </div>
                            </div><br />

                            <div className="row no-margin">
                                <div className="col s3">
                                    Ticker Id: {(tickerId) ? `${tickerId.label}`
                                        : 'NA'}
                                </div>
                                <div className="col s3">
                                    Instrument Count: {(tickerId) ? `${tickerCount}`
                                        : '0'}
                                </div>
                                <br />
                            </div>
                        </div>
                    </div><br />
                    <div className="divider"></div><br />

                    <div className="row no-margin">
                        <div className="col s12 no-margin no-padding">
                            <div className="row no-margin no-padding">
                                <div className="col s2"><label>From</label></div>
                                <div className="col s2">
                                    <input tabIndex="7" className="browser-default" type="datetime-local" name="from_date" value={this.toDateTimeLocal(new Date(from_date))} readOnly />
                                </div>
                                <div className="col"></div>
                                <div className="col s2">
                                    {/* <input type="time" className="browser-default" name="from_time" defaultValue="12:00" onChange={(e) => this.handleTimeChange(e)} /> */}
                                </div>
                            </div>
                            <div className="row no-margin no-padding">
                                <div className="col s2"><label>To</label></div>
                                <div className="col s2">
                                    <input tabIndex="8" className="browser-default" type="datetime-local" name="to_date" value={this.toDateTimeLocal(new Date(to_date))} readOnly />
                                </div>
                                <div className="col"></div>
                                <div className="col s2">
                                    {/* <input type="time" className="browser-default" name="from_time" defaultValue="12:00" onChange={(e) => this.handleTimeChange(e)} /> */}
                                </div>
                            </div><br />
                            <div className="row no-margin no-padding">
                                <div className="col s2"><label>Duration:</label></div>
                                <div className="col s1">{diffDays}</div>
                            </div>
                            <div className="row no-margin no-padding">
                                <div className="col s2"><label>interval</label></div>
                                <div className="col s3">
                                    {interval.label}
                                    {/* <Select value={interval}
                                        tabIndex="9"
                                        onChange={(value) => this.setState({ interval: value })}
                                        styles={customStyles}
                                        options={intervalOptions}
                                        placeholder="&#xf0b0;"
                                        className="fontAwesome browser-default" /> */}
                                </div>
                            </div>
                        </div>
                    </div><br />
                    <div className="divider"></div>
                    <br />
                    <div className="row no-margin no-padding">
                        <div className="col">
                            <button className="btn-small" onClick={this.handleCacheRequest}>Cache Data</button>
                        </div>
                        <div className="col">
                            <button className="btn-small" onClick={this.clearCacheStack}>Clear Cache Stack</button>
                        </div>
                        <div className="col">
                            <button className="btn-small" onClick={this.flushCacheStack}>Flush Cache Stack</button>
                        </div>
                    </div><br />

                </div>
                <div className="col s6">
                    <div className="row no-margin no-padding">
                        <div className="col">
                            <h4>Maintenance!</h4>
                        </div>
                    </div>
                    <div className="divider"></div><br />
                    <div className="row no-margin no-padding">
                        <div className="col">
                            <button onClick={this.updateInstruementsDB} className="waves-effect btn">Update Market Instrument Collection</button> <br /><br />
                            <button onClick={this.syncMWWithInstrumentDB} className="waves-effect btn">Synchronize MWs with Instruments databse</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>)
    }
}

export default AdminConsole
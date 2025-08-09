import React, { Component } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt, faMagic, faList, faPlug, faBroom } from "@fortawesome/free-solid-svg-icons";
import M from "materialize-css";

import MarketWatch from '../../common/MarketWatch/MarketWatch';
import SearchInstrument from './SearchInstrument';
import MWConsoleModalButton from './MWConsoleModalButton';
import * as dbHelper from "../../../helpers/api/db";
import * as tickerHelper from '../../../helpers/api/ticker';


class Ticker extends Component {
    state = {
        listOfMW: [],
        mwInfo: {},
        connected: false
    }
    componentDidMount() {
        M.AutoInit()
        this.syncTickerState()
        this.getAllmwInfo()
        if (this.state.startTicker) {
            setInterval(this.syncTickerState, 5000);
            //     setInterval(this.refreshMW, 5000);
        }
    }
    handleRefresh = () => {
        if (this.state.connected) {
        }
        else { this.syncTickerState() }
    }
    handleConnect = () => { tickerHelper.connectTicker() }
    syncTickerState = async () => {
        tickerHelper.checkTickerStatus()
            .then((res) => {
                let connected = false
                if (res.data) { connected = true }
                if (connected !== this.state.connected) { this.setState({ connected }) }
            })
            .catch((err) => {
                console.log(err)
                this.setState({ connected: false })
            })
    }
    handleInstrumentSearchSelect = (instrument) => {            //no refresh after adding instrument yet
        // this.refs.marketWatch.addToMarketWatch(instrument)
        const mwName = this.refs.marketWatch.getActiveMW();
        const data = { instrument, mwName };
        dbHelper.addInstrumentToCollection(data);
    }
    handleRowSelect = (instrument) => { this.props.onRowSelect(instrument) }
    getAllmwInfo = () => {
        let listOfMW = [];
        dbHelper.getListOfMW(async res => {
            for (let it in res) {
                if (res[it].status) {
                    listOfMW.push(res[it]);
                }
            }
            this.setState({ listOfMW });
            let mwInfo = {};
            for (let it in listOfMW) {
                mwInfo[listOfMW[it]["name"]] = await dbHelper.getMWInstruments(
                    listOfMW[it]["name"]
                );
            }
            await this.setState({ mwInfo });
        });
    };

    handleInstrumentDelete = (mwName, instrument) => {  //no refresh on delete 
        dbHelper.deleteInstrument(mwName, instrument)
    }
    doStuff = () => { tickerHelper.testTicker() }
    updateListOfMW = () => { this.refs.marketWatch.getAllmwInfo() }

    render() {
        let { connected, mwInfo, listOfMW } = this.state
        let { marketData, nightMode } = this.props
        return (<div className="col s4 no-padding no-margin z-depth-1">
            <div className="row no-margin">
                <div className="col s11 no-padding">
                    <div className="row no-margin no-padding">
                        <div className="col s12 no-margin no-padding"><SearchInstrument nightMode={nightMode} onInstrumentSelect={this.handleInstrumentSearchSelect}></SearchInstrument></div>
                    </div>
                    <MarketWatch createAlert={this.props.createAlert}
                        nightMode={nightMode} connected={connected} onRowSelect={this.handleRowSelect}
                        mwInfo={mwInfo} listOfMW={listOfMW} marketData={marketData} onDelete={this.handleInstrumentDelete} ref="marketWatch"></MarketWatch>
                </div>
                <div className="col s1">
                    <div>
                        <button title="Connect ticker" onClick={this.handleConnect} className="mw-panel-btn btn-floating btn-small waves-effect waves-light">
                            <FontAwesomeIcon icon={faPlug} />
                        </button>
                    </div>
                    <div>
                        <button title="Refresh MWs" onClick={this.handleRefresh} className="mw-panel-btn btn-floating btn-small darken-1 waves-effect waves-light">
                            <FontAwesomeIcon icon={faSyncAlt} />
                        </button>
                    </div>
                    <div>
                        <button title="Manage Fields" data-target="manage-mw-fields" className="modal-trigger mw-panel-btn btn-floating btn-small waves-effect waves-light">
                            <FontAwesomeIcon icon={faList} />
                        </button>
                    </div>
                    <MWConsoleModalButton updateListOfMW={this.updateListOfMW} />
                    <div>
                        <button title="Do Stuff" onClick={this.doStuff} className="mw-panel-btn btn-floating btn-small darken-1 waves-effect waves-light">
                            <FontAwesomeIcon icon={faMagic} />
                        </button>
                    </div>
                    <div>
                        <button title="Clear ticker Cache" className="mw-panel-btn btn-floating btn-small waves-effect waves-light">
                            <FontAwesomeIcon icon={faBroom} />
                        </button>
                    </div>
                </div>
            </div>
        </div>)
    }
}

export default Ticker
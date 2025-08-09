import React, { Component } from 'react'
import M from "materialize-css/dist/js/materialize";

import MWConsoleModalButton from "./MWConsoleModalButton";
import SearchInstrument from "./SearchInstrument";
import MarketWatch from "./MarketWatch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt, faMagic, faList } from "@fortawesome/free-solid-svg-icons";

class Ticker extends Component {
    handleInstrumentSelect = instrument => { this.refs.marketWatch.addToMarketWatch(instrument, this.getActiveMW()); };
    getActiveMW = () => { return this.refs.marketWatch.getActiveMW() }
    refreshMW = () => { this.refs.marketWatch.refreshMW() }
    doStuff = () => { M.toast({ html: 'nothing to do' }) }
    getAllmwInfo = () => { this.refs.marketWatch.getAllmwInfo() }
    
    render() {
        let { marketData } = this.props
        return <div className="col s4 no-padding no-margin z-depth-1">
            <div className="row no-margin">
                <div className="col s11 no-padding">
                    <div className="row no-margin no-padding">
                        <div className="col s12 no-margin no-padding">
                            <SearchInstrument onInstrumentSelect={this.handleInstrumentSelect} />
                        </div>
                    </div>
                    <MarketWatch marketData={marketData} onRowSelect={this.props.onRowSelect} ref="marketWatch" />
                </div>
                <div className="col s1">
                    <div>
                        <button title="Do Stuff" onClick={this.doStuff} className="mw-panel-btn btn-floating btn-small grey white-text darken-1 waves-effect waves-light">
                            <FontAwesomeIcon icon={faMagic} />
                        </button>
                    </div>
                    <MWConsoleModalButton updateListOfMW={this.props.updateListOfMW} />
                    <div>
                        <button title="Refresh MWs" onClick={this.refreshMW} className="mw-panel-btn btn-floating btn-small grey white-text darken-1 waves-effect waves-light">
                            <FontAwesomeIcon icon={faSyncAlt} />
                        </button>
                    </div>
                    <div>
                        <button title="Manage Fields" data-target="manage-mw-fields" className="modal-trigger mw-panel-btn btn-floating btn-small white black-text darken-1 waves-effect waves-light">
                            <FontAwesomeIcon icon={faList} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    }
}

export default Ticker
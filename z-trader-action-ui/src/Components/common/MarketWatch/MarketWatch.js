import React, { Component } from "react";
import { Menu, Tab } from "semantic-ui-react";

import MarketWatchView from "./MarketWatchView";
import Hotkeys from "react-hot-keys";
import MarketWatchFieldsSelectionPanel from '../../Terminal/Ticker/MarketWatchFieldsSelectionPanel'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortAmountUp, faRuler } from "@fortawesome/free-solid-svg-icons";

///see if it breaks if any of the props are not provided

class MarketWatch extends Component {
  constructor(props) {
    super(props);
    let fieldsToDisplay = []
    let fieldsDisplayInfo = localStorage.getItem('fieldsDisplayInfo')
    if (!fieldsDisplayInfo) {
      fieldsDisplayInfo = {
        tradingsymbol: true, exchange: true, exchange_token: false,
        expiry: false, instrument_token: false, instrument_type: false,
        last_price: true, lot_size: false, name: false, volume: true,
        segment: false, strike: false, tick_size: false,
        spike3min: true, spike10min: true, min: false, max: false,
        change: true, fluctuation: true, price_zone: true,
      }
    }

    fieldsToDisplay = [
      { accessor: 'tradingsymbol', label: 'Symbol', title: '', toDisplay: fieldsDisplayInfo['tradingsymbol'] },
      { accessor: 'exchange', label: 'Ex', title: '', toDisplay: fieldsDisplayInfo['exchange'] },
      { accessor: 'exchange_token', label: '', title: '', toDisplay: fieldsDisplayInfo['exchange_token'] },
      { accessor: 'expiry', label: '', title: '', toDisplay: fieldsDisplayInfo['expiry'] },
      { accessor: 'instrument_token', label: '', title: '', toDisplay: fieldsDisplayInfo['instrument_token'] },
      { accessor: 'instrument_type', label: '', title: '', toDisplay: fieldsDisplayInfo['instrument_type'] },
      { accessor: 'last_price', label: 'LTP', title: '', toDisplay: fieldsDisplayInfo['last_price'] },
      { accessor: 'lot_size', label: '', title: '', toDisplay: fieldsDisplayInfo['lot_size'] },
      { accessor: 'name', label: '', title: '', toDisplay: fieldsDisplayInfo['name'] },
      { accessor: 'volume', label: 'Vol(L)', title: '', toDisplay: fieldsDisplayInfo['volume'] },
      { accessor: 'segment', label: '', title: '', toDisplay: fieldsDisplayInfo['segment'] },
      { accessor: 'strike', label: '', title: '', toDisplay: fieldsDisplayInfo['strike'] },
      { accessor: 'tick_size', label: '', title: '', toDisplay: fieldsDisplayInfo['tick_size'] },
      { accessor: 'spike3min', label: '% 3m', title: '', toDisplay: fieldsDisplayInfo['spike3min'] },
      { accessor: 'spike10min', label: '% 10m', title: '', toDisplay: fieldsDisplayInfo['spike10min'] },
      { accessor: 'min', label: 'min', title: '', toDisplay: fieldsDisplayInfo['min'] },
      { accessor: 'max', label: 'max', title: '', toDisplay: fieldsDisplayInfo['max'] },
      { accessor: 'change', label: '% \u0394', title: '', toDisplay: fieldsDisplayInfo['change'] },
      { accessor: 'fluctuation', label: <FontAwesomeIcon icon={faRuler} />, title: 'fluctuation', toDisplay: fieldsDisplayInfo['fluctuation'] },
      { accessor: 'price_zone', label: <FontAwesomeIcon icon={faSortAmountUp} />, title: 'price zone', toDisplay: fieldsDisplayInfo['price_zone'] },
    ]
    this.state = {
      activeIndex: 0,
      fieldsToDisplay
    };
  }

  componentDidMount() { }
  getActiveMW = () => {
    let activeIndex = this.refs.tab.state.activeIndex;
    return this.state.listOfMW[activeIndex]["name"];
  };
  onDelete = (mwName, instrument) => {
    this.props.onDelete(mwName, instrument)
  };
  onKeyUp = (keyName, e, handle) => {
    if (keyName === "alt+s") {
      let length = this.state.listOfMW.length;
      let activeIndex = this.refs.tab.state.activeIndex;
      activeIndex = (activeIndex + 1) % length;
      this.setState({ activeIndex });
    }
    if (keyName === "alt+a") {
      let length = this.state.listOfMW.length;
      let activeIndex = this.refs.tab.state.activeIndex;
      activeIndex = (activeIndex + length - 1) % length;
      this.setState({ activeIndex });
    }
  };
  handleTabChange = (e, { activeIndex }) => this.setState({ activeIndex });
  handleRowSelect = (instrument, mwName) => {
    this.props.onRowSelect(instrument);
  }
  handleMWFieldSubmit = (action, fieldsToDisplay) => {
    if (action === 'save') {
      this.setState({ fieldsToDisplay })
      let displayInfo = {}
      for (let it in fieldsToDisplay) {
        displayInfo[fieldsToDisplay[it]['accessor']] = fieldsToDisplay[it]['toDisplay']
      }
      localStorage.setItem('fieldsToDisplay', JSON.stringify(displayInfo))
    }
  }
  // refreshMW = e => this.getAllmwInfo();
  getRandomInstrument = () => {
    let activemwInfo = this.state.mwInfo[this.getActiveMW()];
    let randomInstrument =
      activemwInfo[Math.floor(Math.random() * activemwInfo.length)];
    return randomInstrument;
  };

  render() {
    let { marketData, connected, nightMode, listOfMW, mwInfo } = this.props;
    let { activeIndex, fieldsToDisplay, } = this.state;
    const panes = [];
    let backgroundColor, textColor
    if (nightMode) {
      backgroundColor = "grey"
      textColor = "cyan-text"
    } else {
      backgroundColor = null
      textColor = "cyan-text"
    }

    if (listOfMW.length === 0) {
      let tabsMsg;
      tabsMsg = "No MW found";
      panes.push({
        menuItem: (
          <Menu.Item key={0} className="grey-text">
            {tabsMsg}
          </Menu.Item>
        ),
        render: () => (
          <div className="tab-panes" title={tabsMsg}>
            <Tab.Pane attached="top">
              <MarketWatchView
                nightMode={nightMode} connected={connected} fieldsToDisplay={fieldsToDisplay}
              />
            </Tab.Pane>
          </div>
        )
      });
    }
    for (let it in listOfMW) {
      let name = listOfMW[it]["name"];
      let data = mwInfo[name];
      if (marketData) {
        for (let it in marketData) {
          for (let jt in data) {
            if (String(marketData[it]["instrument_token"]) === String(data[jt]["instrument_token"])) {
              // if(String(marketData[it]["instrument_token"]) ==='265'){
              //   console.log(marketData[it])
              // }
              for (let kt in marketData[it]) {
                data[jt][kt] = marketData[it][kt];
              }
            }
          }
        }
      }
      let length;
      if (data) { length = data.length; }
      panes.push({
        menuItem: (
          <Menu.Item key={it} title={`${length} instruments`}>
            {name}
          </Menu.Item>
        ),
        render: () => {
          return <div className={`tab-panes ${textColor}`}>
            <Tab.Pane attached="top">
              <MarketWatchView createAlert={this.props.createAlert} onRowSelect={instrument => this.handleRowSelect(instrument, name)}
                onDelete={instrument => this.onDelete(name, instrument)}
                mwData={data} connected={connected} fieldsToDisplay={fieldsToDisplay}
                nightMode={nightMode} />
            </Tab.Pane>
          </div>
        }
      });
    }
    return (
      <div className={`mw-tab-container row no-margin no-padding`}>
        {/* {listOfMW ?
          <div className="row">
            {listOfMW.map((object, index) => <div key={index} className={index === 1 ? "active" : ""} id={`test${index}`} className="col s12">{object.name}</div>)}
            <div className="col s12">
              <ul className="tabs">
                {listOfMW.map((object, index) => <li key={index} className="tab col s3"><a href={`#test${index}`}>{object.name}</a></li>)}
              </ul>
            </div>
          </div> : <div></div>} */}
        <Tab
          menu={{
            attached: "bottom",
          }}
          onTabChange={this.handleTabChange}
          activeIndex={activeIndex}
          ref="tab"
          panes={panes}
        />
        <MarketWatchFieldsSelectionPanel id="manage-mw-fields" fieldsToDisplay={fieldsToDisplay} onSave={this.handleMWFieldSubmit} ></MarketWatchFieldsSelectionPanel>
        <Hotkeys keyName="alt+a,alt+s" onKeyUp={this.onKeyUp.bind(this)} />
      </div>
    );
  }
}

export default MarketWatch;

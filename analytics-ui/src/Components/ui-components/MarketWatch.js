import React, { Component } from "react";
import axios from "axios";
import { Menu, Tab } from "semantic-ui-react";

import { getMWInstruments, getListOfMW } from "../../utils/db-queries";
import MarketWatchView from "./MarketWatchView";
import Hotkeys from "react-hot-keys";
import ManageMWFieldsModal from './ManageMWFieldsModal'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortAmountUp, faRuler, faCheckCircle } from "@fortawesome/free-solid-svg-icons";

class MarketWatch extends Component {
  constructor(props) {
    super(props);
    let fieldsToDisplay = []
    let fieldsDisplayInfo = JSON.parse(localStorage.getItem('fieldsDisplayInfo'))
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
      { accessor: 'status', label: '', title: '', toDisplay: fieldsDisplayInfo['status'] },
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
      listOfMW: [],
      mwInfo: {},
      activeIndex: 0,
      fieldsToDisplay,
    };
  }

  componentDidMount() {
    this.getAllmwInfo();
  }
  getActiveMW = () => {
    let activeIndex = this.refs.tab.state.activeIndex;
    return this.state.listOfMW[activeIndex]["name"];
  };
  getAllmwInfo = () => {
    let listOfMW = [];
    getListOfMW()
      .then(async res => {
        for (let it in res) {
          if (res[it].status) {
            listOfMW.push(res[it]);
          }
        }
        this.setState({ listOfMW });
        let mwInfo = {};
        for (let it in listOfMW) {
          mwInfo[listOfMW[it]["name"]] = await getMWInstruments(
            listOfMW[it]["name"]
          );
        }
        await this.setState({ mwInfo });
      });
  };
  addToMarketWatch = (instrument, mwName) => {
    let data = { instrument, mwName };
    axios.post("http://localhost:3000/db/add-instrument-to-collection", data)
      .then(async res => {
        let mwInfo = this.state.mwInfo;
        mwInfo[mwName] = await getMWInstruments(mwName);
        this.setState({ mwInfo });
      })
      .catch(err => console.log(err));
  };
  onDelete = (instrument, mwName) => {
    axios.get(`http://localhost:3000/db/delete-instrument?mwName=${mwName}&instrument_token=${instrument.instrument_token}`)
      .then(async res => {
        let mwInfo = this.state.mwInfo;
        mwInfo[mwName] = await getMWInstruments(mwName);
        this.setState({ mwInfo });
      })
      .catch(err => console.log(err));
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
  handleRowSelect = (instrument, mwName) => this.props.onRowSelect(instrument);
  refreshMW = e => this.getAllmwInfo();
  getRandomInstrument = () => {
    let activemwInfo = this.state.mwInfo[this.getActiveMW()];
    let randomInstrument =
      activemwInfo[Math.floor(Math.random() * activemwInfo.length)];
    return randomInstrument;
  };
  handleMWFieldSubmit = (action, fieldsToDisplay) => {
    if (action === 'save') {
      this.setState({ fieldsToDisplay })
      let fieldsDisplayInfo = {}
      for (let it in fieldsToDisplay) {
        fieldsDisplayInfo[fieldsToDisplay[it]['accessor']] = fieldsToDisplay[it]['toDisplay']
      }
      localStorage.setItem('fieldsDisplayInfo', JSON.stringify(fieldsDisplayInfo))
    }
  }

  render() {
    let { marketData } = this.props;
    let { mwInfo, activeIndex, listOfMW, fieldsToDisplay } = this.state;
    const panes = [];
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
              <MarketWatchView fieldsToDisplay={fieldsToDisplay} />
            </Tab.Pane>
          </div>
        )
      });
    }
    for (let it in listOfMW) {
      let name = listOfMW[it]["name"];
      let data = mwInfo[name];
      if (marketData) {
        for (let jt in data) {
          let marketDataPresent = false
          for (let it in marketData) {
            if (marketData[it]["instrument_token"] === data[jt]["instrument_token"]) {
              marketDataPresent = true
              for (let kt in marketData[it]) {
                data[jt][kt] = marketData[it][kt];
              }
            }
          }
          if (!marketDataPresent) { data[jt]['status'] = false }
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
        render: () => (
          <div className="tab-panes">
            <Tab.Pane attached="top">
              <MarketWatchView
                onRowSelect={instrument =>
                  this.handleRowSelect(instrument, name)
                }
                onDelete={instrument => this.onDelete(instrument, name)}
                mwData={data}
                fieldsToDisplay={fieldsToDisplay}
              />
            </Tab.Pane>
          </div>
        )
      });
    }
    return (
      <div className="mw-tab-container row no-margin no-padding">
        <Tab
          menu={{ attached: "bottom" }}
          onTabChange={this.handleTabChange}
          activeIndex={activeIndex}
          ref="tab"
          panes={panes}
        />
        <ManageMWFieldsModal id="manage-mw-fields" fieldsToDisplay={fieldsToDisplay} onSave={this.handleMWFieldSubmit}></ManageMWFieldsModal>
        <Hotkeys keyName="alt+a,alt+s" onKeyUp={this.onKeyUp.bind(this)} />
      </div>
    );
  }
}

export default MarketWatch;

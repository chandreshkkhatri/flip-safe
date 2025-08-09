import React, { Component } from "react";
import { withRouter, Route, Link, Switch, Redirect } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun, faBell } from "@fortawesome/free-solid-svg-icons";

import * as commonHelper from '../helpers/common'
import * as tickerHelper from '../helpers/api/ticker'
import * as marketWatchHelper from '../helpers/marketWatch';

import Home from "./Home/Home";
import Holdings from './Holdings/Holdings'
import TradeView from './Terminal/TradeView'
import Dev from "./Dev/Dev";
import Orders from './Orders/Orders'
import Positions from './Positions/Positions'
import Funds from './Funds/Funds'
import Alerts from './Alerts/Alerts'
import Ticker from './Terminal/Ticker/Ticker'
import Simulator from './Simulator'
import AdminConsole from './AdminConsole'
import DraggableWindow from "./common/DraggablePanel/DraggableWindow";
import NavBar from './layout/NavBar'
import AppContent from "./layout/AppContent";

import M from 'materialize-css'

const Logout = () => {
  return <div>Logging out ...</div>;
};

class Dashboard extends Component {
  constructor(props) {
    super(props)
    let nightMode = false
    const _nightMode = localStorage.getItem('nightMode')
    if (_nightMode === 'true') { nightMode = true }
    const chartInstrument = JSON.parse(localStorage.getItem('chartInstrument'))
    this.state = {
      nightMode,
      chartInstrument,
      startTicker: true,
    }
  }

  componentDidMount() {
    this.refreshMW()
    if (this.state.startTicker) {
      setInterval(this.syncTickerState, 5000);
      setInterval(this.refreshMW, 5000);
    }
    let elems = this.refs['dropdown-trigger']
    let options = { coverTrigger: false }
    M.Dropdown.init(elems, options)
  }

  refreshMW = () => {
    tickerHelper.getTicks()
      .then((res) => {
        const marketData = marketWatchHelper.processTicks(res)
        this.setState({ marketData })
      })
      .catch((err) => console.log(err))
  }

  toggleTheme = () => {
    const nightMode = !this.state.nightMode
    localStorage.setItem('nightMode', nightMode)
    this.setState({ nightMode })
  }
  handleLogout() { this.props.handleLogout(); }
  handleRowSelect = (chartInstrument) => {
    this.setState({ chartInstrument })
    localStorage.setItem('chartInstrument', JSON.stringify(chartInstrument))
    this.props.history.push(`${this.props.match.path}/trade`)
  }
  handleOrderRequest = (type, orderInstrument) => {
    this.refs.draggableWindow.prepareOrder(type, orderInstrument)
  }
  handleOrderExitRequest = (orderInfo) => {
    this.refs.draggableWindow.prepareOrderExit(orderInfo)
  }
  handleCreateAlertRequest = (instrument) => {
    let { marketData } = this.state
    instrument = commonHelper.addTicksToInstrument(instrument, marketData)
    this.refs.draggableWindow.prepareAlert(instrument)
  }
  render() {
    let path = this.props.match.path;
    let { nightMode, chartInstrument, marketData } = this.state
    let navColor, appBackgroundColor, textColor, navTextColor
    if (nightMode) {
      navColor = "blue-grey darken-3"
      appBackgroundColor = "blue-grey darken-4"
      navTextColor = "cyan-text"
      textColor = "cyan-text"
    } else {
      navColor = "cyan darken-4"
      appBackgroundColor = "white"
      navTextColor = "white-text"
      textColor = "black-text"
    }
    chartInstrument = commonHelper.addTicksToInstrument(chartInstrument, marketData)

    return (
      <div className="app">
        <NavBar navColor={navColor} navTextColor={navTextColor}>
          <ul id="nav-mobile" className={`right hide-on-med-and-down`}>
            <li><Link className={`${navTextColor}`} to={`${path}/home`}>Home</Link></li>
            <li><Link className={`${navTextColor}`} to={`${path}/trade`}>Trade</Link></li>
            <li><Link className={`${navTextColor}`} to={`${path}/orders`}>Orders</Link></li>
            <li><Link className={`${navTextColor}`} to={`${path}/holdings`}>Holdings</Link></li>
            <li><Link className={`${navTextColor}`} to={`${path}/positions`}>Positions</Link></li>
            <li><Link className={`${navTextColor}`} to={`${path}/funds`}>Funds</Link></li>
            <li><Link className={`${navTextColor}`} to={`${path}/simulator`}>Simulator</Link></li>
            <li><Link className={`${navTextColor}`} to={`${path}/admin`}>Admin</Link></li>
            <li><Link className={`${navTextColor}`} to={`${path}/alerts`}>
              <FontAwesomeIcon color="cyan" icon={faBell} />
            </Link></li>
            <li><button className="link-button link-button-padded" onClick={this.toggleTheme}>
              <FontAwesomeIcon color="cyan" icon={nightMode ? faMoon : faSun} />
            </button></li>
            <li><Link className={`${navTextColor}`} to={`${path}/logout`}>Logout</Link></li>
          </ul>
        </NavBar>
        <AppContent textColor={textColor} appBackgroundColor={appBackgroundColor}>
          <div className="row no-margin">
            <div className="col s8 no-padding">
              <Switch>
                <Route path={`${path}/dev`} render={(props) => <Dev {...props} />} />
                <Route path={`${path}/home`} component={Home} />
                <Route path={`${path}/trade`} render={(props) => <TradeView
                  {...props} prepareOrder={this.handleOrderRequest} nightMode={nightMode}
                  createAlert={this.handleCreateAlertRequest} chartInstrument={chartInstrument} />} />
                <Route path={`${path}/orders`} render={({ match }) => <Orders match={match}
                  handleOrderExitRequest={this.handleOrderExitRequest} />} />
                <Route path={`${path}/holdings`} render={({ match }) => <Holdings match={match} />} />
                <Route path={`${path}/positions`} render={({ match }) => <Positions match={match} />} />
                <Route path={`${path}/funds`} render={({ match }) => <Funds match={match} />} />
                <Route path={`${path}/alerts`} render={({ match }) => <Alerts match={match} />} />
                <Route path={`${path}/simulator`} render={(props) => <Simulator {...props} nightMode={nightMode} />} />
                <Route path={`${path}/admin`} render={(props) => <AdminConsole {...props} />} />
                <Route path={`${path}/logout`} render={() => { this.handleLogout(); return <Logout />; }} />
                <Route render={() => <Redirect to={`${path}/dev`} />} />
              </Switch>
            </div>
            <Ticker ref="ticker" nightMode={nightMode} createAlert={this.handleCreateAlertRequest} onRowSelect={this.handleRowSelect} marketData={marketData}></Ticker>
          </div>
        </AppContent>
        <DraggableWindow ref="draggableWindow"></DraggableWindow>
      </div >
    );
  }
}
export default withRouter(Dashboard);

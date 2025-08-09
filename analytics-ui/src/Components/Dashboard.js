import React, { Component } from "react";
import { withRouter, Route, Link, Switch, Redirect } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

import Home from "./Home";
import Simulator from "./Simulator";
import AdminConsole from "./AdminConsole";

const Logout = () => {
  return <div>Logging out ...</div>;
};
class Dashboard extends Component {
  constructor(props) {
    super(props)
    let nightMode = false
    const _nightMode = localStorage.getItem('nightMode')
    if (_nightMode) {
      nightMode = true
    }
    this.state = {
      nightMode,
    }
  }
  componentDidMount() { }
  toggleTheme = () => {
    const nightMode = !this.state.nightMode
    localStorage.setItem('nightMode', nightMode)
    this.setState({ nightMode })
  }
  handleLogout() {
    this.props.handleLogout();
  }
  render() {
    let path = this.props.match.path;
    let { nightMode } = this.state
    return (
      <div className="dashboard">
        <div className="row no-margin navbar-fixed navbar-container">
          <nav className="grey  darken-2">
            <div className="nav-wrapper ">
              <div className="col s12">
                <div className="col brand-logo"><i className="material-icons">widgets</i>Z-Dashboard</div>
                <div className="col right">
                  <ul id="nav-mobile" className="right hide-on-med-and-down">
                    <li><Link to={`${path}/home`}>Home</Link></li>
                    <li><Link to={`${path}/simulator`}>Simulator</Link></li>
                    <li><Link to={`${path}`} onClick={this.toggleTheme}><FontAwesomeIcon icon={nightMode ? faSun : faMoon} /></Link></li>
                    <li><Link to={`${path}/logout`}>Logout</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </nav>
        </div>
        <div className="row no-margin dashboard-content">
          <div className="col s12 no-margin no-padding">
            <Switch>
              <Route path={`${path}/home`} component={Home} />
              <Route path={`${path}/simulator`} render={() => <Simulator />} />
              <Route path={`${path}/admin-console`} render={() => <AdminConsole />} />
              <Route path={`${path}/logout`} render={() => { this.handleLogout(); return <Logout />; }} />
              <Route render={() => <Redirect to={`${path}/simulator`} />} />
            </Switch>
          </div>
        </div>
        {/* <footer></footer> */}
      </div>
    );
  }
}
export default withRouter(Dashboard);

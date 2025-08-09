import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import * as authHelper from './helpers/api/auth';
import "./App.css";
import "materialize-css/dist/css/materialize.min.css";
import "semantic-ui-css/semantic.min.css";

const ServiceUnavailable = () => {
  return <div>Service Unavailable</div>
}

const PrivateRoute = ({ auth, handleLogout, component: Component, ...rest }) => {
  return (
    <div>
      <Route {...rest} render={
        props => auth
          ? (<Component {...props} handleLogout={handleLogout} />)
          : (<Redirect to="/login" />)} />
    </div>
  );
};

class App extends Component {
  constructor(props) {
    super(props);
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const allowOfflineAccess = sessionStorage.getItem('allowOfflineAccess') === 'true';

    this.state = {
      login_url: "",
      isLoggedIn,
      allowOfflineAccess,
      checkedLoginStatus: false
    };
  }

  componentDidMount() {
    this.handleAuthStatus();
    setInterval(this.handleAuthStatus, 20000);
  }

  handleAuthStatus = async () => {
    const state = await authHelper.checkAuthStatus()
    this.setState(state)

    if (state.isLoggedIn !== this.state.isLoggedIn || !this.state.checkedLoginStatus) {
      sessionStorage.setItem('isLoggedIn', state.isLoggedIn)
      this.setState({ checkedLoginStatus: true });
    }
  }

  runOfflineMode = () => {
    sessionStorage.setItem('allowOfflineAccess', true);
    this.setState({ allowOfflineAccess: true });
  };

  render() {
    let { isLoggedIn, login_url, allowOfflineAccess, serviceUnavailable, checkedLoginStatus } = this.state;
    let auth = isLoggedIn || allowOfflineAccess;

    return (
      <div>
        <Router>
          {serviceUnavailable
            ? <ServiceUnavailable />
            : <div>{checkedLoginStatus
              ? <Switch>
                <PrivateRoute auth={auth}
                  path="/dashboard"
                  component={Dashboard}
                  handleLogout={async () => {
                    this.setState(await authHelper.handleLogout())
                  }} />
                <Route path="/login" render={
                  () => (
                    <Login
                      checkedLoginStatus={this.state.checkedLoginStatus}
                      runOfflineMode={this.runOfflineMode}
                      loginurl={login_url}
                      isLoggedIn={isLoggedIn} />)
                } />
                <Route render={() => {
                  return <Redirect to='/dashboard' />
                }} />
              </Switch>
              : <></>}
            </div>
          }
        </Router>
      </div>
    );
  }
}

export default App;

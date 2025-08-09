import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import PropTypes from 'prop-types';
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import * as authHelper from './helpers/api/auth';
import "./App.css";
import "materialize-css/dist/css/materialize.min.css";
import "semantic-ui-css/semantic.min.css";

const ServiceUnavailable = () => (
  <div className="service-unavailable">
    <h2>Service Unavailable</h2>
    <p>Please try again later.</p>
  </div>
);

const PrivateRoute = ({ auth, handleLogout, component: Component, ...rest }) => (
  <Route 
    {...rest} 
    render={props => 
      auth 
        ? <Component {...props} handleLogout={handleLogout} />
        : <Redirect to="/login" />
    } 
  />
);

PrivateRoute.propTypes = {
  auth: PropTypes.bool.isRequired,
  handleLogout: PropTypes.func.isRequired,
  component: PropTypes.func.isRequired
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
    this.authInterval = setInterval(this.handleAuthStatus, 20000);
  }

  componentWillUnmount() {
    if (this.authInterval) {
      clearInterval(this.authInterval);
    }
  }

  handleAuthStatus = async () => {
    try {
      const state = await authHelper.checkAuthStatus();
      this.setState(state);

      if (state.isLoggedIn !== this.state.isLoggedIn || !this.state.checkedLoginStatus) {
        sessionStorage.setItem('isLoggedIn', state.isLoggedIn);
        this.setState({ checkedLoginStatus: true });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      this.setState({ serviceUnavailable: true });
    }
  }

  runOfflineMode = () => {
    sessionStorage.setItem('allowOfflineAccess', true);
    this.setState({ allowOfflineAccess: true });
  };

  handleLogout = async () => {
    try {
      const state = await authHelper.handleLogout();
      this.setState(state);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  render() {
    const { isLoggedIn, login_url, allowOfflineAccess, serviceUnavailable, checkedLoginStatus } = this.state;
    const auth = isLoggedIn || allowOfflineAccess;

    if (serviceUnavailable) {
      return <ServiceUnavailable />;
    }

    if (!checkedLoginStatus) {
      return <div className="loading">Loading...</div>;
    }

    return (
      <Router>
        <Switch>
          <PrivateRoute 
            auth={auth}
            path="/dashboard"
            component={Dashboard}
            handleLogout={this.handleLogout}
          />
          <Route 
            path="/login" 
            render={() => (
              <Login
                checkedLoginStatus={checkedLoginStatus}
                runOfflineMode={this.runOfflineMode}
                loginurl={login_url}
                isLoggedIn={isLoggedIn} 
              />
            )} 
          />
          <Route render={() => <Redirect to="/dashboard" />} />
        </Switch>
      </Router>
    );
  }
}

export default App;

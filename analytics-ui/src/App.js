import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import axios from "axios";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import "./App.css";
import "materialize-css/dist/css/materialize.min.css";
import "semantic-ui-css/semantic.min.css";

const PrivateRoute = ({ auth, handleLogout, component: Component, ...rest }) => {
  return (
    <div>
      <Route {...rest} render={props => { return auth === true ? (<Component {...props} handleLogout={handleLogout} />) : (<Redirect to="/login" />); }} />
    </div>
  );
};

class App extends Component {
  constructor(props) {
    super(props);
    let isLoggedIn = sessionStorage.getItem('isLoggedIn')
    this.state = {
      login_url: "",
      isLoggedIn,
      allowOfflineAccess: false,
      checkedLoginStatus: true
    };
  }

  checkAuthStatus = () => {
    axios.get("http://localhost:3000/auth/check-status")
      .then(res => {
        let isLoggedIn = res.data.isLoggedIn;
        let login_url;
        if (res.data.isLoggedIn === false) {
          login_url = res.data.login_url;
        }
        if (isLoggedIn !== this.state.isLoggedIn || !this.state.checkedLoginStatus) {
          sessionStorage.setItem('isLoggedIn', isLoggedIn)
          this.setState({ isLoggedIn, login_url, checkedLoginStatus: true });
        }
      })
      .catch(err => this.setState({ serviceUnavailable: true }));
  };

  handleLogout = () => {
    axios.get("http://localhost:3000/auth/logout")
      .then(res => {
        let isLoggedIn = res.data.isLoggedIn;
        let login_url;
        if (res.data.isLoggedIn === false) { login_url = res.data.login_url; }
        sessionStorage.setItem('isLoggedIn', isLoggedIn)
        this.setState({ isLoggedIn, login_url });
      })
      .catch(err => console.log(err));
  };
  runOfflineMode = () => { this.setState({ allowOfflineAccess: true }); };

  render() {
    let { isLoggedIn, login_url, allowOfflineAccess } = this.state;
    let auth = isLoggedIn || allowOfflineAccess;
    return (
      <div>
        <Router>
          <Switch>
            <PrivateRoute auth={auth} path="/dashboard" component={Dashboard} handleLogout={this.handleLogout} />
            <Route path="/login" render={() => (<Login checkedLoginStatus={this.state.checkedLoginStatus} runOfflineMode={this.runOfflineMode} loginurl={login_url} isLoggedIn={isLoggedIn} />)} />
            <Route render={() => {
              console.log('via redirect')
              return <Redirect to='/dashboard' />
            }} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;

import React, { Component } from "react";
import { withRouter, Redirect } from "react-router-dom";
import * as authHelper from '../helpers/api/auth'

const LoginCardWhite = props => (
  <div className="login-card">
    <div style={{ visibility: props.visibility }} className="progress row">
      <div className="indeterminate" />
    </div>
    <h2 className="row" style={{ padding: "50px 0 20px 0" }}>
      {" "}
      Welcome to the Z-Trader{" "}
    </h2>
    <div className="row">
      <form className="col s8 offset-s2">
        <input onChange={e => props.onChange(e)} className="validate form-input" placeholder="API Key" type="text" name="apikey" value={props.apikey} />
        <input onChange={e => props.onChange(e)} className="validate form-input" placeholder="API Secret" type="password" name="apisecret" value={props.apisecret} />
        <br />
        <br />
        <button type="button" onClick={e => props.login(e)} className="waves-effect waves-light btn">
          Login with Kite
        </button>
        <p>or</p>
        <button type="button" className="waves-effect grey lighten-2 black-text waves-light btn-small" id="offline-mode-button" onClick={e => { props.runOfflineMode(e); }}>
          Offline mode
        </button>
      </form>
    </div>
  </div>
);

class Login extends Component {
  constructor() {
    super();
    this.state = {
      visibility: "hidden",
      apikey: "",
      apisecret: ""
    };
  }
  handleCreds = e => {
    let prop = e.target.name;
    if (prop === "apikey") {
      this.setState({ apikey: e.target.value });
    } else if (prop === "apisecret") {
      this.setState({ apisecret: e.target.value });
    }
  };
  login = async e => {
    await authHelper.setLoginInfo()
    window.location.replace(this.props.loginurl);
    this.setState({ visibility: "visible" });
  };
  runOfflineMode = () => {
    this.props.runOfflineMode();
    this.props.history.push("/dashboard");
  };

  render() {
    let _redirect;
    if (this.props.isLoggedIn) {
      _redirect = <Redirect to="/dashboard" />;
    } else {
      _redirect = <div />;
    }

    return (
      <div className="container login-container">
        <LoginCardWhite visibility={this.state.visibility} login={this.login} runOfflineMode={this.runOfflineMode}
          onChange={this.handleCreds} apikey={this.state.apikey} apisecret={this.state.apisecret} />
        {_redirect}
      </div>
    );
  }
}

export default withRouter(Login);

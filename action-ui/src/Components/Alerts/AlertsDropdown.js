import React, { Component } from 'react'
import { withRouter, Link, } from "react-router-dom";

class AlertsDropdown extends Component {
    render() {
        let path = this.props.match.path;

        return <ul id='alerts-dropdown' className='dropdown-content'>
            <div className="divider"></div>
            <li><Link to={`${path}/alerts`}>See all</Link></li>
        </ul>
    }
}

export default withRouter(AlertsDropdown)
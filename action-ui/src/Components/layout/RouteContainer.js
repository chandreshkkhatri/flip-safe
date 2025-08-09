import React, { Component } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt, faExclamationTriangle, } from "@fortawesome/free-solid-svg-icons";

class RouteContainer extends Component {
    render() {
        let { children, title, networkError, refreshAction } = this.props
        return <div className="route-container">
            <div className="row">
                <div className="col s12">
                    <div />
                    <h2><span>{title}</span>
                        <div className="col right">{refreshAction ? <button onClick={refreshAction} className="btn-small"><FontAwesomeIcon icon={faSyncAlt} /></button> : <></>}</div>
                        <div className="col right">{networkError ? <FontAwesomeIcon color="orange" icon={faExclamationTriangle} /> : <></>}</div>
                    </h2>
                    <div className="divider" /> <br />
                    {children}
                </div>
            </div>
        </div>
    }
}

export default RouteContainer
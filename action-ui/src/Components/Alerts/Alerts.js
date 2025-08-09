import React, { Component } from 'react'
import { getAlerts, cancelAlert } from '../../helpers/api/alerts'
import RouteContainer from '../layout/RouteContainer';

class Alerts extends Component {
    state = {
        alerts: []
    }
    componentDidMount() {
        this.getAlerts()
    }
    getAlerts = () => {
        getAlerts()
            .then((res) => {
                this.setState({ alerts: res.data.alerts })
            })
            .catch((err) => console.log(err))
    }
    cancelAlert = (alert_id) => {
        if (window.confirm(`Confirm?`)) {
            cancelAlert(alert_id)
                .then((res) => console.log(res.data))
                .catch(err => console.log(err))
        }
    }

    render() {
        let { alerts } = this.state

        return <RouteContainer title="Alerts" refreshAction={this.getAlerts}>
            <h5>Pending</h5>
            <table>
                <thead>
                    <tr>
                        <th style={{ width: '20%' }}>Trading Symbol</th>
                        <th style={{ width: '20%' }}>Trigger Price</th>
                        <th style={{ width: '20%' }}>Trigger Type</th>
                        <th style={{ width: '20%' }}>Time Stamp</th>
                        <th style={{ width: '20%' }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {alerts.filter(object => (object.status === "pending")).map((object, index) => <tr key={index}>
                        <td>{object.tradingsymbol}</td>
                        <td>{object.trigger_price}</td>
                        <td >{object.trigger_type}</td>
                        <td >{object.time_stamp}</td>
                        <td >
                            {object.status}
                            <button className="right" onClick={(e) => this.cancelAlert(object._id)}>Cancel</button>
                        </td>
                    </tr>)}
                </tbody>
            </table>
            <h5>Expired</h5>
            <table>
                <thead>
                    <tr>
                        <th style={{ width: '20%' }}>Trading Symbol</th>
                        <th style={{ width: '20%' }}>Trigger Price</th>
                        <th style={{ width: '20%' }}>Trigger Type</th>
                        <th style={{ width: '20%' }}>Time Stamp</th>
                        <th style={{ width: '20%' }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {alerts.filter(object => (object.status !== "pending")).map((object, index) => <tr key={index}>
                        <td>{object.tradingsymbol}</td>
                        <td>{object.trigger_price}</td>
                        <td >{object.trigger_type}</td>
                        <td >{object.time_stamp}</td>
                        <td >{object.status}</td>
                    </tr>)}
                </tbody>
            </table>

        </RouteContainer>
    }
}

export default Alerts
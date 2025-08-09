import React, { Component } from 'react'
import M from 'materialize-css'

import { createAlert } from '../../helpers/api/alerts'

class CreateAlertCard extends Component {
    state = {
        triggerPrice: 0,
        triggerType: 'greater_than'
    }
    componentDidMount() {
        M.updateTextFields()
    }
    componentDidUpdate() {
        let { alertInstrument } = this.props
        if (alertInstrument !== this.state.alertInstrument) {
            let triggerPrice = alertInstrument.last_price
            if (triggerPrice !== this.state.triggerPrice) {
                this.setState({ triggerPrice, alertInstrument })
            }
        }
    }
    createAlert = (instrument_token, trigger_price) => {
        createAlert(instrument_token, trigger_price)
            .then((res) => console.log(res))
            .catch((err) => console.log(err))
    }

    handleTriggerPriceChange = (e) => {
        let triggerPrice = e.target.value
        this.setState({ triggerPrice })
    }
    handleLTPSelect = (e) => {
        this.setState({ triggerPrice: this.props.alertInstrument.last_price })
    }
    handleTriggerTypeChange = (e) => {
        this.setState({ triggerType: e.target.value })
    }
    handleSubmit = (e) => {
        let tradingsymbol = this.props.alertInstrument.tradingsymbol
        let last_price = this.props.alertInstrument.last_price
        let { triggerPrice: trigger_price, triggerType: trigger_type } = this.state
        if (trigger_price === 0) {
            alert('Trigger Price cannot be zero')
        } else if (((trigger_type === 'greater_than') && (trigger_price < last_price)) || ((trigger_type === 'less_than') && (trigger_price > last_price))) {
            alert('Alert conditions already met')
        }
        else {
            createAlert(tradingsymbol, trigger_price, trigger_type)
            this.props.hideWindow()
        }
    }
    render() {
        let { triggerPrice, triggerType, alertInstrument } = this.state
        if (!alertInstrument) { alertInstrument = {} }
        let { tradingsymbol, last_price } = alertInstrument

        return <div>
            <div style={{ minWidth: '400px' }}>
                <div className="card-content no-padding">
                    <span className={`card-title white-text blue-grey`} style={{ padding: '20px 10px 10px 45px' }}>
                        Create Alert <br />
                        {tradingsymbol}
                    </span>
                    <div className="row no-margin" style={{ padding: '15px 0 0 15px' }}>
                        <div className="col s12" onClick={this.handleLTPSelect}>LTP: {last_price}</div>
                    </div>
                    <div className="row no-margin" style={{ padding: '15px 0 0 15px' }}>
                        <div className="col input-field">
                            <input type="number" value={triggerPrice} min="0" onChange={this.handleTriggerPriceChange} />
                            <label >Trigger</label>
                        </div>
                        <div className="col">
                            <label >Trigger Type</label>
                            <form>
                                <div>
                                    <label>
                                        <input type="radio" name="request-type" className="with-gap" value="greater_than"
                                            checked={triggerType === 'greater_than'}
                                            onChange={this.handleTriggerTypeChange} />
                                        <span>{`>=`}</span>
                                    </label>
                                </div>
                                <div>
                                    <label>
                                        <input type="radio" name="request-type" className="with-gap" value="less_than"
                                            checked={triggerType === 'less_than'}
                                            onChange={this.handleTriggerTypeChange} />
                                        <span>{`<=`}</span>
                                    </label>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="card-action">
                        <button className="btn" onClick={this.handleSubmit}>Submit</button>
                        <button className="btn-small grey lighten-4 black-text" onClick={this.props.hideWindow}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    }
}

export default CreateAlertCard
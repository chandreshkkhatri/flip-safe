import React, { Component } from 'react'
import M from 'materialize-css'

import { exitOrder, createExitTrigger } from '../../../helpers/api/orders'

class OrderExitCard extends Component {
    constructor(props) {
        super(props)
        let triggerPrice, orderInfo
        if (props.orderInfo) {
            triggerPrice = props.orderInfo.price
            orderInfo = props.orderInfo
        } else {
            triggerPrice = 0
            orderInfo = {}
        }
        this.state = {
            requestType: 'trigger',
            triggerPrice,
            orderInfo
        }
    }
    componentDidMount() {
        M.updateTextFields()
    }
    componentDidUpdate() {
        M.updateTextFields()
        let { orderInfo } = this.props
        if (this.state.orderInfo !== orderInfo) {
            this.setState({ orderInfo })
        }
    }
    // updateTradeForm = (e, object) => {
    //     let { price, quantity } = object
    //     this.setState({ price, quantity })
    //   }
    
    prepareOrderExit() {
        let { orderInfo } = this.props
        let triggerPrice = orderInfo.price
        if (orderInfo.status === "TRIGGER PENDING") {
            triggerPrice = orderInfo.trigger_price
        }
        this.setState({ orderInfo, triggerPrice })
    }
    handleRequestTypeChange = (e) => {
        let requestType = e.target.value
        let triggerPrice = this.props.orderInfo.price
        this.setState({ requestType, triggerPrice })
    }
    handleTriggerPriceChange = (e) => {
        this.setState({ triggerPrice: e.target.value })
    }
    handleSubmit = (e) => {
        let { requestType, triggerPrice: trigger_price, orderInfo } = this.state
        let { variety, order_id, tradingsymbol } = orderInfo
        if (requestType === 'regular') {
            exitOrder(variety, order_id)
        } else if (requestType === 'trigger') {
            createExitTrigger(variety, order_id, tradingsymbol, trigger_price)
                .then((res) => console.log(res.data))
                .catch((err) => console.log(err))
        }
    }
    render() {
        let { requestType, triggerPrice } = this.state
        let { orderInfo } = this.props
        return <div style={{ minWidth: '400px' }}>
            <div className="card-content no-padding">
                <span className={`card-title white-text blue-grey`} style={{ padding: '20px 10px 10px 45px' }}>
                    {orderInfo.tradingsymbol}
                </span>
                <div className="row no-margin" style={{ padding: '15px 0 0 15px' }}>
                    <div className="col">
                        {orderInfo.order_type}
                    </div>
                    <div className="col">
                        {orderInfo.status}
                    </div>
                    <div className="col">
                        {orderInfo.pending_quantity}/{orderInfo.quantity}
                    </div>
                    <div className="col">
                        {orderInfo.exchange}
                    </div>
                    <div className="col">
                        {orderInfo.transaction_type}
                    </div>
                </div>
                <div className="row no-margin" style={{ padding: '15px 0 0 15px' }}>
                    <div className="col">
                        <form>
                            <label>
                                <input type="radio" name="request-type" className="with-gap" value="regular"
                                    checked={requestType === 'regular'}
                                    onChange={this.handleRequestTypeChange} />
                                <span>Regular</span>
                            </label> &nbsp;&nbsp;&nbsp;&nbsp;
                            <label>
                                <input type="radio" name="request-type" className="with-gap" value="trigger"
                                    checked={requestType === 'trigger'}
                                    onChange={this.handleRequestTypeChange} />
                                <span>Trigger</span>
                            </label>
                        </form>
                    </div>
                </div>
                <div className="row no-margin" style={{ padding: '15px 0 0 15px' }}>
                    {requestType === 'trigger' ?
                        <div className="col s12 input-field">
                            <input type="number" value={triggerPrice} min="0" onChange={this.handleTriggerPriceChange} />
                            <label >Trigger</label>
                        </div> : <div></div>}
                </div>
            </div>
            <div className="card-action">
                <button className="btn" onClick={this.handleSubmit}>Submit</button>
                <button className="btn-small grey lighten-4 black-text" onClick={this.props.hideWindow}>Cancel</button>
            </div>
            {/* <OrderBook orderInstrument={orderInstrument} updateTradeForm={this.updateTradeForm}></OrderBook> */}
        </div >
    }
}

export default OrderExitCard
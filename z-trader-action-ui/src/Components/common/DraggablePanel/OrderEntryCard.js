import React, { Component } from 'react'
import M from "materialize-css";

import OrderBook from '../OrderBook/OrderBook'
import { createOrder, createOrderTrigger, modifyOrder } from '../../../helpers/api/orders'

class OrderEntryCard extends Component {

    constructor(props) {
        super(props)
        this.state = {
            type: props.type,
            orderMode: 'regular',
            orderProduct: 'mis',
            orderType: 'NRML',
            price: 0,
            quantity: 0,
            totalAmount: 0,
            orderVariety: 'regular',
            orderValidity: 'day',
            orderBookVisiblity: false,
            triggerPrice: 0
        }
    }
    componentDidMount() {
        M.updateTextFields()
    }
    componentDidUpdate() {
        let { type } = this.props
        if (this.state.type !== type) {
            this.setState({ type })
        }
        // if (this.state.orderInstrument !== orderInstrument) {
        //     this.setState({ orderInstrument })
        // }
    }
    updateTradeForm = (e, object) => {
        let { price, quantity } = object
        this.setState({ price, quantity })
      }    
    createOrder = () => {
        let { type, orderVariety: variety, orderInstrument, orderMode, orderProduct: product, orderType: order_type, price, quantity, orderValidity: validity } = this.state
        let { tradingsymbol, exchange } = orderInstrument
        let transaction_type = type
        let params = { exchange, tradingsymbol, transaction_type, quantity, product, order_type, }
        let order_trigger_price      //to be initialized properly
        if (orderMode === 'regular') {
            if (variety === 'bo') {
                if (order_type === "NRML") {
                    let { sl: stoploss, target: squareoff, tsl: trailing_stoploss } = this.state
                    params = { ...params, validity, price, stoploss, squareoff, trailing_stoploss }
                }
                else if (order_type === "SL") {
                    let { sl: stoploss, target: squareoff, tsl: trailing_stoploss, triggerPrice: trigger_price } = this.state
                    params = { ...params, validity, price, trigger_price, stoploss, squareoff, trailing_stoploss }
                }
                else { console.log('invalid inputs') }
            }
            else if (variety === 'co') {
                if (order_type === 'NRML') {
                    let { triggerPrice: trigger_price } = this.state
                    params = { ...params, price, trigger_price }
                }
                else if (order_type === 'MARKET') {
                    let { triggerPrice: trigger_price } = this.state
                    params = { ...params, trigger_price }
                }
                else { console.log('invalid inputs') }
            }
            else if (variety === 'amo' || variety === 'regular') {  //remove disclosed quantity on amo
                if (order_type === 'MARKET') {
                    params = { ...params, validity }
                } else if (order_type === 'NRML') {
                    params = { ...params, price, validity }
                } else if (order_type === "SL") {
                    let { triggerPrice: trigger_price } = this.state
                    params = { ...params, price, trigger_price, validity }
                } else if (order_type === "SL-M") {
                    let { triggerPrice: trigger_price } = this.state
                    params = { ...params, trigger_price, validity }
                }
            }
            else { console.log('invalid inputs') }
        }
        else {
            ///create triggers
        }
        if (orderMode === 'regular') {
            createOrder(variety, params)
                .then((res) => console.log(res.data))
                .catch((err) => console.log(err))
        } else if (orderMode === 'trigger') {
            createOrderTrigger(variety, params, transaction_type, order_trigger_price)
                .then((res) => console.log(res))
                .catch((err) => console.log(err))
        }
    }

    modifyOrder = () => {
        modifyOrder()
    }
    toggerTriggerFieldDisable = () => {
        if (this.state.orderMode === "regular") {

        }
    }
    handleOrderModeChange = (e) => {
        this.setState({ orderMode: e.target.value })
    }
    handleOrderProductChange = (e) => {
        this.setState({ orderProduct: e.target.value })
    }
    handleOrderTypeChange = (e) => {
        this.setState({ orderType: e.target.value })
    }

    handlePriceChange = (e) => {
        let price = e.target.value
        let totalAmount = this.state.quantity * price
        this.setState({ price, totalAmount })
    }
    handleQuantityChange = (e) => {
        let quantity = e.target.value
        let totalAmount = this.state.price * quantity
        this.setState({ quantity, totalAmount })
    }
    handleTotalAmountChange = (e) => {
        let totalAmount = e.target.value
        let quantity = Math.floor(totalAmount / this.state.price)
        this.setState({ totalAmount, quantity })
    }
    handleTriggerChange = (e) => {
        let triggerPrice = e.target.value
        this.setState({ triggerPrice })
    }
    handleSlChange = (e) => {
        let sl = e.target.value
        this.setState({ sl })
    }
    handleTargetChange = (e) => {
        let targetPrice = e.target.value
        this.setState({ targetPrice })
    }
    handleTslChange = (e) => {
        let tsl = e.target.value
        this.setState({ tsl })
    }
    handleOrderVarietyChange = (e) => {
        let orderVariety = e.target.value
        this.setState({ orderVariety })
    }
    handleOrderValidityChange = (e) => {
        let orderValidity = e.target.value
        this.setState({ orderValidity })
    }
    toggleType = () => {
        if (this.state.type === 'buy') {
            this.setState({ type: 'sell' })
        } else {
            this.setState({ type: 'buy' })
        }
    }
    toggleOrderBookVisibility = () => {
        this.setState({ orderBookVisiblity: !this.state.orderBookVisiblity })
    }

    render() {
        let { type, orderMode, orderProduct, orderType,
            price, quantity, totalAmount, triggerPrice, sl, targetPrice, tsl,
            disclosedQty, orderValidity, orderVariety } = this.state
        // let totalAmount = Math.floor(price * quantity * 100) / 100
        let { orderInstrument } = this.props
        // console.log(orderInstrument, 'orderentry')
        let title, cardColor
        let disableTrigger = true
        if (type === 'buy') {
            title = "Buy"
            cardColor = "teal darken-2"
        }
        if (type === "sell") {
            title = "Sell"
            cardColor = "red"
        }
        return <div>
            <div className={`card-content no-padding`}>
                <span className={`card-title white-text ${cardColor}`} style={{ padding: '20px 10px 10px 45px' }}>{title}
                    <div className="switch right" style={{ padding: '0 45px 40px 0' }}>
                        <label>
                            <input type="checkbox" checked={type === 'buy'} onChange={this.toggleType} />
                            <span className="lever"></span>
                        </label>
                    </div>
                </span>

                <div className="row no-margin" style={{ padding: '15px 0 0 15px' }}>
                    <div className="col">
                        <div className="row no-margin">
                            <div className="col s3">
                                <form>
                                    <label>
                                        <input type="radio" name="order-mode" className="with-gap" value="regular"
                                            checked={orderMode === 'regular'}
                                            onChange={this.handleOrderModeChange}
                                        />
                                        <span>Reg</span>
                                    </label><br />
                                    <label>
                                        <input type="radio" name="order-mode" className="with-gap" value="trigger"
                                            checked={orderMode === 'trigger'}
                                            onChange={this.handleOrderModeChange}
                                        />
                                        <span>Trgr</span>
                                    </label>
                                </form>
                            </div>
                            <div className="col s3">
                                <form>
                                    <label>
                                        <input type="radio" name="order-product" className="with-gap" value="mis"
                                            checked={orderProduct === 'mis'}
                                            onChange={this.handleOrderProductChange}
                                        />
                                        <span>MIS</span>
                                    </label><br />
                                    <label>
                                        <input type="radio" name="order-product" className="with-gap" value="cnc"
                                            checked={orderProduct === 'cnc'}
                                            onChange={this.handleOrderProductChange}
                                        />
                                        <span>CNC</span>
                                    </label>
                                </form>
                            </div>
                            <div className="col s6">
                                <form>
                                    <label>
                                        <input type="radio" name="order-type" className="with-gap" value="MARKET"
                                            checked={orderType === 'MARKET'}
                                            onChange={this.handleOrderTypeChange}
                                        />
                                        <span>Market</span>
                                    </label>&nbsp;&nbsp;&nbsp;&nbsp;
                          <label>
                                        <input type="radio" name="order-type" className="with-gap" value="NRML"
                                            checked={orderType === 'NRML'}
                                            onChange={this.handleOrderTypeChange}
                                        />
                                        <span>Limit</span>
                                    </label><br />
                                    <label>
                                        <input type="radio" name="order-type" className="with-gap" value="SL"
                                            checked={orderType === "SL"}
                                            onChange={this.handleOrderTypeChange}
                                        />
                                        <span>SL</span>
                                    </label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <label>
                                        <input type="radio" name="order-type" className="with-gap" value="SL-M"
                                            checked={orderType === "SL-M"}
                                            onChange={this.handleOrderTypeChange}
                                        />
                                        <span>SL-M</span>
                                    </label>
                                </form>
                            </div>
                        </div>
                        <div className="row no-margin">
                            <div className="col s3 input-field ">
                                <input type="number" value={price} min="0" onChange={this.handlePriceChange} />
                                <label >Price</label></div>
                            <div className="col s3 input-field ">
                                <input type="number" value={quantity} min="0" onChange={this.handleQuantityChange} className="validate" />
                                <label>Quantity</label></div>
                            <div className="col s3 input-field ">
                                <input type="number" value={totalAmount} min="0" onChange={this.handleTotalAmountChange} className="validate" />
                                <label>Total</label></div>
                            <div className="input-field  col s3">
                                <input type="number" value={triggerPrice} min="0" onChange={this.handleTriggerChange} className="validate" disabled={disableTrigger} />
                                <label>Trigger</label></div>
                        </div>
                        {orderVariety === 'BO' ?
                            <div className="row no-margin">
                                <div className="input-field  col s3">
                                    <input type="number" value={sl} onChange={this.handleSlChange} className="validate" />
                                    <label>Stoploss</label></div>
                                <div className="input-field  col s3">
                                    <input type="number" value={targetPrice} onChange={this.handleTargetChange} className="validate" />
                                    <label>Target</label></div>
                                <div className="input-field  col s3">
                                    <input type="number" value={tsl} onChange={this.handleTslChange} className="validate" />
                                    <label>Trailing Stoploss</label></div>
                                <div className="input-field  col s3">
                                    <input type="number" value={disclosedQty} onChange={this.handleDisQtyChange} className="validate" />
                                    <label>Disclosed Qty</label></div>
                            </div> : <div />}
                    </div>
                </div>
            </div>
            <div className="card-action">
                <div className="row no-margin">
                    <div className="col s8">
                        <form>
                            <label>
                                <input type="radio" name="order-variety" className="with-gap" value="regular"
                                    checked={orderVariety === 'regular'}
                                    onChange={this.handleOrderVarietyChange}
                                />
                                <span>Regular</span>
                            </label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <label>
                                <input type="radio" name="order-variety" className="with-gap" value="BO"
                                    checked={orderVariety === 'BO'}
                                    onChange={this.handleOrderVarietyChange}
                                />
                                <span>BO</span>
                            </label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <label>
                                <input type="radio" name="order-variety" className="with-gap" value="CO"
                                    checked={orderVariety === 'CO'}
                                    onChange={this.handleOrderVarietyChange}
                                />
                                <span>CO</span>
                            </label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              <label>
                                <input type="radio" name="order-variety" className="with-gap" value="AMO"
                                    checked={orderVariety === 'AMO'}
                                    onChange={this.handleOrderVarietyChange}
                                />
                                <span>AMO</span>
                            </label>
                        </form>
                        <form>
                            <label>
                                <input type="radio" name="order-validity" className="with-gap" value="day"
                                    checked={orderValidity === 'day'}
                                    onChange={this.handleOrderValidityChange}
                                />
                                <span>Day</span>
                            </label>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              <label>
                                <input type="radio" name="order-validity" className="with-gap" value="ioc"
                                    checked={orderValidity === 'ioc'}
                                    onChange={this.handleOrderValidityChange}
                                />
                                <span>IOC</span>
                            </label>
                        </form>
                    </div>
                    <button className={cardColor + " btn-small"} style={{ width: '100px' }} onClick={this.createOrder}>{type}</button>&nbsp;&nbsp;&nbsp;&nbsp;
                      <button className="btn-small grey lighten-4 black-text" onClick={this.props.hideWindow}>Cancel</button>
                </div>
            </div>
            <OrderBook orderInstrument={orderInstrument} updateTradeForm={this.updateTradeForm}></OrderBook>
        </div>
    }
}

export default OrderEntryCard
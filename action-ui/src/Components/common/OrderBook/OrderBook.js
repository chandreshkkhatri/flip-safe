import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

class OrderBook extends Component {
    state = {
        orderBookVisiblity: false,
    }
    toggleOrderBookVisibility = () => {
        this.setState({ orderBookVisiblity: !this.state.orderBookVisiblity })
    }
    render() {
        let { orderInstrument } = this.props
        let props = this.props
        let { orderBookVisiblity } = this.state
        return <div style={{ padding: '10px 0 20px 45px' }}><button className={`link-button browser-default`} onClick={this.toggleOrderBookVisibility}>Orderbook {orderBookVisiblity ? <FontAwesomeIcon icon={faChevronUp}></FontAwesomeIcon> : <FontAwesomeIcon icon={faChevronDown}></FontAwesomeIcon>}</button>
            <div style={{ display: orderBookVisiblity ? 'block' : 'none' }}>
                {orderInstrument ? <div>
                    <div className="row">
                        <div className="col s5">
                            <h4>Buy Orders</h4>
                            <table className="striped highlight  black-text">
                                <thead className="teal lighten-3">
                                    <tr>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Orders</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {orderInstrument.depth ? orderInstrument.depth.buy.map((object, index) => <tr key={index} onClick={(e) => props.updateTradeForm(e, object)} style={{ cursor: "pointer" }}>
                                        <td>{object.quantity}</td>
                                        <td>{object.price}</td>
                                        <td>{object.orders}</td>
                                    </tr>) : <tr />
                                    }
                                </tbody>
                            </table>
                        </div>
                        <div className="col s5">
                            <h4>Sell Orders</h4>
                            <table className="striped highlight  black-text">
                                <thead className="teal lighten-3">
                                    <tr>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {orderInstrument.depth ? orderInstrument.depth.sell.map((object, index) => <tr key={index} onClick={(e) => props.updateTradeForm(e, object)} style={{ cursor: "pointer" }}>
                                        <td>{object.quantity}</td>
                                        <td>{object.price}</td>
                                        <td>{object.orders}</td>
                                    </tr>) : <tr />
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div> : <div> No Instrument Selected</div>}
            </div>
        </div>
    }
}

export default OrderBook
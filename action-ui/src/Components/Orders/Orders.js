import React, { Component } from "react";
import { getOrders } from '../../helpers/api/kc'
import M from 'materialize-css'
import * as commonHelper from '../../helpers/common'
import RouteContainer from "../layout/RouteContainer";

class Orders extends Component {
  state = { orders: [] }
  componentDidMount() {
    this.getOrders()
    let elems = this.refs['dropdown-trigger']
    let options = { coverTrigger: false }
    M.Dropdown.init(elems, options)  //let instances =
  }

  getOrders = () => {
    getOrders()
      .then((res) => {
        this.setState({ orders: res.data })
      })
      .catch((err) => console.log(err))
  }
  handleOrderExitRequest = (e, orderInfo) => {
    this.props.handleOrderExitRequest(orderInfo)
  }

  render() {
    const { orders } = this.state
    return (<RouteContainer title="Orders" refreshAction={this.getOrders}>
      <div className="row no-margin">
        <div className="col s12">
          <h3>Trigger Pending</h3>
          <table>
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Time</th>
                <th style={{ width: '5%' }}>Type</th>
                <th style={{ width: '20%' }}>Instrument</th>
                <th style={{ width: '10%' }}>Product</th>
                <th style={{ width: '10%' }}>Quantity</th>
                <th style={{ width: '10%' }}>Avg. price</th>
                <th style={{ width: '10%' }}>Status</th>
              </tr>
            </thead>

            <tbody></tbody>
          </table>
        </div>
      </div>
      <br /><br /><br /><br /><br />
      <div className="divider"></div>
      <div className="row no-margin">
        <div className="col s12">
          <h3>Orders Placed</h3>
          <table className="">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Time</th>
                <th style={{ width: '5%' }}>Type</th>
                <th style={{ width: '20%' }}>Instrument</th>
                <th style={{ width: '10%' }}>Product</th>
                <th style={{ width: '10%' }}>Quantity</th>
                <th style={{ width: '10%' }}>Avg. price</th>
                <th style={{ width: '10%' }}>Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.filter((object) => (object.status === 'OPEN' || object.status === "TRIGGER PENDING" || object.status === "AMO REQ RECEIVED")).map((object, index) => {
                return <tr key={index}>
                  <td>{commonHelper.dateStampToDate(object.order_timestamp)}</td>
                  <td>{object.transaction_type}</td>
                  <td>{object.tradingsymbol}</td>
                  <td>{object.product}</td>
                  <td>{object.quantity}</td>
                  <td>{object.average_price}</td>
                  <td>{object.status}
                    <button className="dropdown-trigger right" ref="dropdown-trigger" id='order-exit' onClick={(e) => this.handleOrderExitRequest(e, object)}>Exit</button>
                    <ul id='order-exit' className='dropdown-content'>
                      <li><a href="#!">one</a></li>
                      <li><a href="#!">two</a></li>
                    </ul>
                  </td>
                </tr>
              })}
            </tbody>
          </table>
        </div>
      </div><br /><br />
      <div className='row no-margin'>
        <div className="col s12">
          <table className="">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>Time</th>
                <th style={{ width: '5%' }}>Type</th>
                <th style={{ width: '20%' }}>Instrument</th>
                <th style={{ width: '10%' }}>Product</th>
                <th style={{ width: '10%' }}>Quantity</th>
                <th style={{ width: '10%' }}>Avg. price</th>
                <th style={{ width: '10%' }}>Status</th>
              </tr>
            </thead>

            <tbody>
              {orders.filter((object) => (object.status !== 'OPEN' && object.status !== "TRIGGER PENDING" && object.status !== "AMO REQ RECEIVED")).map((object, index) => {
                return <tr key={index}>
                  <td>{commonHelper.dateStampToDate(object.order_timestamp)}</td>
                  <td>{object.transaction_type}</td>
                  <td>{object.tradingsymbol}</td>
                  <td>{object.product}</td>
                  <td>{object.quantity}</td>
                  <td>{object.average_price}</td>
                  <td>{object.status}</td>
                </tr>
              })}
            </tbody>
          </table>
        </div>
      </div>
    </RouteContainer>);
  }
}

export default Orders;

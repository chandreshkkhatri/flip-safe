import React, { Component } from "react";

import * as kcHelper from '../../helpers/api/kc'
import RouteContainer from "../layout/RouteContainer";

class Holdings extends Component {
  state = { holdings: [] }
  componentDidMount() {
    this.getHoldings()
  }
  getHoldings = () => {
    kcHelper.getHoldings()
      .then((res) => {
        this.setState({ holdings: res.data })
      })
      .catch((err) => console.log(err))
  }
  render() {
    const { holdings } = this.state
    
    return (<RouteContainer title="Holdings" refreshAction={this.getHoldings}>
      <div className="row no-margin">
        <div className="col s12 no-padding">
          <table>
            <thead>
              <tr>
                <th>Instruments</th>
                <th>Quantity</th>
                <th>Avg. Cost</th>
                <th>LTP</th>
                <th>PnL</th>
                <th>Day Chg</th>
              </tr>
            </thead>

            <tbody>
              {holdings.map((object, index) => <tr key={index}>
                <td>{object.tradingsymbol}</td>
                <td>{object.quantity}</td>
                <td>{object.average_price}</td>
                <td>{object.last_price}</td>
                <td>{Math.floor(object.pnl)}</td>
                <td>{object.day_change_percentage}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </RouteContainer>
    );
  }
}

export default Holdings;

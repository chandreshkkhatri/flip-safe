import React, { Component } from "react";
import * as kcHelper from '../../helpers/api/kc'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie, faDollyFlatbed } from "@fortawesome/free-solid-svg-icons";
import RouteContainer from "../layout/RouteContainer";

class Funds extends Component {

  state = { funds: { equity: {}, commodity: {} } }

  componentDidMount() {
    this.getMargins()
  }

  getMargins = () => {
    kcHelper.getMargins()
      .then((res) => {
        this.setState({ funds: res.data })
      })
      .catch((err) => console.log(err))
  }

  render() {
    const { funds } = this.state

    return (<RouteContainer title="Funds" refreshAction={this.getMargins}>
      <div className="row no-margin">
        <div className="col s6 no-padding">
          <div className="row no-margin">
            <FontAwesomeIcon icon={faChartPie} />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <h3 className="inline-block">Equity</h3>
            <div className="col s12">Net: {funds.equity.net}</div>
            <br /><br /><br />
            <div className="col s4">
              <h4>Available</h4>
              <p>Cash: {funds.equity.available ? funds.equity.available.cash : '0'}</p>
              <p>Pay-in: {funds.equity.available ? funds.equity.available.intraday_payin : '0'}</p>
              <p>Collateral: {funds.equity.available ? funds.equity.available.collateral : '0'}</p>
              <p>Margin: {funds.equity.available ? funds.equity.available.adhoc_margin : '0'}</p>
            </div>
            <div className="col s4">
              <h4>Utilized</h4>
              <p>Debit: {funds.equity.utilised ? funds.equity.utilised.debits : '0'}</p>
              <p>Exposure: {funds.equity.utilised ? funds.equity.utilised.exposure : '0'}</p>
              <p>Holding Sales: {funds.equity.utilised ? funds.equity.utilised.holding_sales : '0'}</p>
              <p>Realised: {funds.equity.utilised ? funds.equity.utilised.m2m_realised : '0'}</p>
              <p>Unrealised: {funds.equity.utilised ? funds.equity.utilised.m2m_unrealised : '0'}</p>
              <p>Pay-out: {funds.equity.utilised ? funds.equity.utilised.payout : '0'}</p>
              <p>Span: {funds.equity.utilised ? funds.equity.utilised.span : '0'}</p>
              <p>Turnover: {funds.equity.utilised ? funds.equity.utilised.turnover : '0'}</p>
            </div>
          </div>
        </div>
        <div className="col s6">
          <FontAwesomeIcon icon={faDollyFlatbed} />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <h3 className="inline-block">Commodity</h3>
          <div className="col s12">Net: {funds.commodity.net}</div>
          <br /><br /><br />
          <div className="col s4">
            <h4>Available</h4>
            <p>Cash: {funds.commodity.available ? funds.commodity.available.cash : '0'}</p>
            <p>Pay-in: {funds.commodity.available ? funds.commodity.available.intraday_payin : '0'}</p>
            <p>Collateral: {funds.commodity.available ? funds.commodity.available.collateral : '0'}</p>
            <p>Margin: {funds.commodity.available ? funds.commodity.available.adhoc_margin : '0'}</p>
          </div>
          <div className="col s4">
            <h4>Utilized</h4>
            <p>Debit: {funds.commodity.utilised ? funds.commodity.utilised.debits : '0'}</p>
            <p>Exposure: {funds.commodity.utilised ? funds.commodity.utilised.exposure : '0'}</p>
            <p>Holding Sales: {funds.commodity.utilised ? funds.commodity.utilised.holding_sales : '0'}</p>
            <p>Realised: {funds.commodity.utilised ? funds.commodity.utilised.m2m_realised : '0'}</p>
            <p>Unrealised: {funds.commodity.utilised ? funds.commodity.utilised.m2m_unrealised : '0'}</p>
            <p>Pay-out: {funds.commodity.utilised ? funds.commodity.utilised.payout : '0'}</p>
            <p>Span: {funds.commodity.utilised ? funds.commodity.utilised.span : '0'}</p>
            <p>Turnover: {funds.commodity.utilised ? funds.commodity.utilised.turnover : '0'}</p>
          </div>
        </div>
      </div>
    </RouteContainer>
    );
  }
}

export default Funds;

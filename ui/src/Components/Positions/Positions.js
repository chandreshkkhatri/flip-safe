import React, { Component } from 'react'

import * as kcHelper from '../../helpers/api/kc'
import RouteContainer from "../layout/RouteContainer";

class Positions extends Component {
    constructor() {
        super()
        this.state = { positions: { net: [], day: [] } }
    }
    componentDidMount() {
        this.getPositions()
    }
    getPositions = () => {
        kcHelper.getPositions()
            .then((res) => {
                this.setState({ positions: res.data })
            })
            .catch((err) => console.log(err))
    }
    render() {
        let { positions } = this.state
        let commodityPositions = positions.net.filter((object) => object.exchange === 'MCX')
        let equityPosiions = positions.net.filter((object) => object.exchange !== 'MCX')

        return (<RouteContainer title="Positions" refreshAction={this.getPositions}>
            <h5>Equity</h5>
            <table>
                <thead>
                    <tr>
                        <th style={{ width: '20%' }}>Product</th>
                        <th style={{ width: '30%' }}>Instrument</th>
                        <th style={{ width: '20%' }}>Quantity</th>
                        <th style={{ width: '20%' }}>PnL</th>
                        {/* <th style={{width:'10%'}}>Quantity</th> */}
                    </tr>
                </thead>
                {equityPosiions.length === 0 ? <tbody><tr><td>No Open Positions</td></tr></tbody> :
                    <tbody>{equityPosiions.map((object, it) => {
                        return <tr key={it}>
                            <td>{object.product}</td>
                            <td>{object.tradingsymbol}</td>
                            <td >{object.quantity}</td>
                            <td >{Math.floor(object.pnl)}</td>
                        </tr>
                    })}</tbody>}
            </table>
            <h5>Commodity</h5>
            <table>
                <thead>
                    <tr>
                        <th style={{ width: '20%' }}>Product</th>
                        <th style={{ width: '30%' }}>Instrument</th>
                        <th style={{ width: '20%' }}>Quantity</th>
                        <th style={{ width: '20%' }}>PnL</th>
                        {/* <th style={{width:'10%'}}>Quantity</th> */}
                    </tr>
                </thead>

                {commodityPositions.length === 0 ? <tbody><tr><td>No Open Positions</td></tr></tbody> :
                    <tbody>{commodityPositions.map((object, it) => {
                        return <tr key={it}>
                            <td>{object.product}</td>
                            <td>{object.tradingsymbol}</td>
                            <td >{object.quantity}</td>
                            <td >{object.pnl}</td>
                        </tr>
                    })}</tbody>}
            </table>
        </RouteContainer>
        )
    }
}

export default Positions
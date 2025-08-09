import React, { Component } from "react"
import { Table } from "semantic-ui-react" //Icon, 
import axios from "axios"

class Positions extends Component {
    constructor() {
        super()
        this.state = { positions: { net: [], day: [] } }
    }
    componentDidMount() {
        this.getPositions()

    }
    getPositions = () => {
        axios.get('http://localhost:3000/kc/get-positions')
            .then((res) => {
                console.log(typeof(res.data))
                this.setState({ positions: res.data })
            })
            .catch((err) => console.log(err))
    }
    render() {
        let { positions } = this.state
        return (
            <div>
                <h5>Equity Positions</h5>
                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Product</Table.HeaderCell>
                            <Table.HeaderCell>Instrument</Table.HeaderCell>
                            <Table.HeaderCell>Quantity</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {positions.net.map((object, it) => {
                            if (object.exchange !== 'MCX') {
                                return <Table.Row key={it}>
                                    <Table.Cell>{object.product}</Table.Cell>
                                    <Table.Cell>{object.tradingsymbol}</Table.Cell>
                                    <Table.Cell>{object.quantity}</Table.Cell>
                                </Table.Row>
                            } else { return <div></div>}
                        })}
                    </Table.Body>
                </Table>
                <h5>Commodity Positions</h5>
                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>Product</Table.HeaderCell>
                            <Table.HeaderCell>Instrument</Table.HeaderCell>
                            <Table.HeaderCell>Quantity</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {positions.net.map((object, it) => {
                            if (object.exchange === 'MCX') {
                                return <Table.Row key={it}>
                                    <Table.Cell>{object.product}</Table.Cell>
                                    <Table.Cell>{object.tradingsymbol}</Table.Cell>
                                    <Table.Cell>{object.quantity}</Table.Cell>
                                </Table.Row>
                            } else { return <div></div>}
                        })}
                    </Table.Body>
                </Table>

            </div>)
    }
}

export default Positions
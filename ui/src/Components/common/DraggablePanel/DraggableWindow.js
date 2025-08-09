import React, { Component } from 'react'
import PropTypes from 'prop-types';

import OrderEntryCard from './OrderEntryCard'
import Draggable from 'react-draggable'; // The default
import OrderExitCard from './OrderExitCard';
import CreateAlertCard from '../../Alerts/CreateAlertCard'

class DraggableWindow extends Component {
  state = {}
  prepareOrder = (type, orderInstrument) => {
    this.setState({ visible: true, windowType: 'entry', type, orderInstrument })
  }
  prepareOrderExit = (orderInfo) => {
    this.setState({ visible: true, windowType: 'exit', orderInfo })
  }
  prepareAlert = (alertInstrument) => {
    this.setState({ visible: true, windowType: 'alert', alertInstrument })
  }
  makeVisible = () => {
    this.setState({ visible: true })
  }
  hideWindow = () => {
    this.setState({ visible: false })
  }

  render() {
    let { visible, orderInstrument, alertInstrument, windowType, type, orderInfo } = this.state
    let visibility = visible ? 'visible' : 'hidden'
    let window
    switch (windowType) {
      case 'exit':
        window = <OrderExitCard orderInfo={orderInfo} hideWindow={this.hideWindow}></OrderExitCard>
        break
      case 'entry':
        window = <OrderEntryCard type={type} orderInstrument={orderInstrument} hideWindow={this.hideWindow}></OrderEntryCard>
        break
      case 'alert':
        window = <CreateAlertCard alertInstrument={alertInstrument} hideWindow={this.hideWindow}></CreateAlertCard>
        break
      default:
        window = <CreateAlertCard></CreateAlertCard>
    }
    return <div style={{
      position: 'fixed',
      display: 'block',
      left: '400px', top: '200px',
      zIndex: 20,
      cursor: 'pointer',
      visibility
    }}>
      <Draggable>
        <div className="row no-margin">
          <div className="col s12">
            <div className="card">
              {window}
            </div>
          </div>
        </div>
      </Draggable>
    </div >

  }
}
DraggableWindow.propTypes = {
  type: PropTypes.oneOf(['buy', 'sell']),
  windowType: PropTypes.oneOf(['entry', 'exit'])
}

export default DraggableWindow
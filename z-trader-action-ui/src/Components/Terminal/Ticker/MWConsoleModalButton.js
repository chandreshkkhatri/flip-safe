import React, { Component } from 'react'
import { Modal } from 'react-materialize'
import ManageMarketWatchPanel from './ManageMarketWatchPanel'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from '@fortawesome/free-solid-svg-icons';

class MWConsoleModalButton extends Component {

    showModal = () => {
        let ref = this.refs['mw-modal']
        ref.showModal()
    }

    updateListOfMW = () => {
        this.props.updateListOfMW()
    }
    render() {
        const ModalTrigger = (<button title="Manage MWs" className="mw-console-btn btn-floating btn-small waves-effect waves-light">
            <FontAwesomeIcon icon={faCog} color=""></FontAwesomeIcon>
        </button>)
        return (<div>
            <Modal
                id="mw-modal"
                ref="mw-modal"
                className="center-align mw-console"
                header="Manage Market Watches"
                trigger={ModalTrigger}
                modalOptions={{ dismissible: true }} >
                <ManageMarketWatchPanel updateListOfMW={this.updateListOfMW}></ManageMarketWatchPanel>
            </Modal>
        </div >)
    }
}

export default MWConsoleModalButton
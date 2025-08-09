import React, { Component } from 'react'
import { Modal } from 'react-materialize'
import MWConsole from './MWConsole'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from '@fortawesome/free-solid-svg-icons';

class MWConsoleModalButton extends Component {

    showModal = () => {
        let ref = this.refs['mw-modal']
        ref.showModal()
    }

    render() {
        const ModalTrigger = (<button title="Manage MWs" className="mw-panel-btn btn-floating btn-small waves-effect waves-light white">
            <FontAwesomeIcon icon={faCog} color="black"></FontAwesomeIcon>
        </button>)
        return (<div>
            <Modal
                id="mw-modal"
                ref="mw-modal"
                className="center-align mw-console"
                header="Manage Market Watches"
                trigger={ModalTrigger}
                modalOptions={{ dismissible: true }} >
                <MWConsole updateListOfMW={this.props.updateListOfMW}></MWConsole>
            </Modal>
        </div >)
    }
}

export default MWConsoleModalButton
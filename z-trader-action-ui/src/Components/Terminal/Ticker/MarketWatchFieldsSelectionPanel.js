import React, { Component } from 'react'

class MarketWatchFieldsSelectionPanel extends Component {
    constructor(props) {
        super(props)
        this.state = {
            fieldsToDisplay: props.fieldsToDisplay
        }
    }
    handleChange = (e, object) => {
        let { fieldsToDisplay } = this.state
        const checked = e.target.checked
        for (let it in fieldsToDisplay) {
            if (fieldsToDisplay[it].accessor === object.accessor) {
                fieldsToDisplay[it].toDisplay = checked
            }
        }
        this.setState({ fieldsToDisplay })
    }
    handleSubmit = (e) => {
        const target = e.target
        const action = target.name
        this.props.onSave(action, this.state.fieldsToDisplay)
    }
    render() {
        let { id } = this.props
        let { fieldsToDisplay } = this.state
        return <div id={id} className="modal">
            <div className="modal-content no-margin">
                <div className="row center-align">
                    <h4>Select fields to display</h4>
                </div>
                <div className="row">
                    {fieldsToDisplay.map((object, it) => <div key={it} className="col s4"><label><input type="checkbox" checked={object.toDisplay} onChange={(e) => this.handleChange(e, object)} /><span>{object.accessor}</span></label></div>)}
                </div>

            </div>
            <div className="modal-footer">
                <button name="save" onClick={this.handleSubmit} className="modal-close waves-effect waves-light btn-flat">Save</button>
                <button name="close" onClick={this.handleSubmit} className="modal-close waves-effect waves-green btn-flat">Close</button>
            </div>
        </div>
    }
}

export default MarketWatchFieldsSelectionPanel
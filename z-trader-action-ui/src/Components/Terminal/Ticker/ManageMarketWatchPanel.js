import React, { Component } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faCloudUploadAlt, faSyncAlt, faBroom, faPlug } from '@fortawesome/free-solid-svg-icons';
import M from "materialize-css";
import * as dbHelper from '../../../helpers/api/db';

class ManageMarketWatchPanel extends Component {
    constructor() {
        super()
        this.state = {
            listOfMW: [],
            listOfUpdates: {
                listToDelete: [], listToUpdateStatus: []
            },
            newMWName: '',
            newMWStatus: false,
            tickerInfo: []
        }
    }
    componentWillMount() {
        this.getListOfMW()
        this.getTickerInfo()
    }
    componentDidMount() {
        M.AutoInit()
    }
    getTickerInfo = async () => {
        dbHelper.getTickerInfo((tickerInfo) => {
            this.setState({ tickerInfo })
        });
    }
    addInstrumentsToTicker = async (e, object) => {
        let mwName = object.name
        let tickerNo = window.prompt("Please enter ticker no(1,2,3) to subscribe to?")
        if (tickerNo === '1' || tickerNo === '2' || tickerNo === '3') {
            dbHelper.subscribeToTicker(mwName, tickerNo, (html) => {
                this.getTickerInfo()
                M.toast({ html })
            });
        } else { window.alert('Invalid ticker no') }
    }
    purgeTicker = (e, tickerNo) => {
        let confirm = window.confirm("Are you sure you want to purge the ticker?")
        if (confirm) {
            dbHelper.clearTicker(tickerNo, (html) => {
                this.getTickerInfo()
                M.toast({ html })
            });
        } else { return }
    }
    cleanTicker = (e, tickerNo) => {
        console.log('clean ticker to be implemented')
    }
    getListOfMW = async () => {
        let listOfMW = []
        dbHelper.getListOfMW(() => {
            this.setState({ listOfMW })
        })
    }
    switchStatus = (e, object) => {
        let mwName = object.name
        let listOfMW = this.state.listOfMW
        let listOfUpdates = this.state.listOfUpdates
        let listToUpdateStatus = listOfUpdates.listToUpdateStatus
        for (let it in listOfMW) {
            if (listOfMW[it].name === mwName) {
                listOfMW[it]['status'] = e.target.checked
                let flag = true
                for (let it1 in listToUpdateStatus) {
                    if (listToUpdateStatus[it1].name === mwName) {
                        flag = false
                        listToUpdateStatus.splice(it1, 1)
                    }
                }
                if (flag) {
                    listToUpdateStatus.push(listOfMW[it])
                }
            }
        }
        listOfUpdates.listToUpdateStatus = listToUpdateStatus
        this.setState({ listOfMW, listOfUpdates })
    }
    switchState = (e, object) => {
        let mwName = object.name
        let listOfMW = this.state.listOfMW
        let listOfUpdates = this.state.listOfUpdates
        let listToDelete = listOfUpdates.listToDelete
        for (let it in listOfMW) {
            if (listOfMW[it]['name'] === mwName) {
                if (listOfMW[it]['toDelete'] === true) {
                    for (let it1 in listToDelete) {
                        if (listToDelete[it1].name === listOfMW[it].name) {
                            listToDelete.splice(it1, 1)
                        }
                    }
                    listOfMW[it]['toDelete'] = false
                }
                else {
                    listOfMW[it]['toDelete'] = true
                    listToDelete.push(listOfMW[it])
                }
            }
        }
        listOfUpdates.listToDelete = listToDelete
        this.setState({ listOfMW, listOfUpdates })
    }
    onSave = async () => {
        let listOfUpdates = { listOfUpdates: this.state.listOfUpdates, appName: 'ztrader' }
        dbHelper.updateMarketWatchInfo(listOfUpdates, () => {
            this.setState({
                listOfUpdates: {
                    listToDelete: [], listToUpdateStatus: []
                },
                newMWName: '',
                newMWStatus: false
            })
            this.getListOfMW()
            this.props.updateListOfMW()
        })
    }
    onReset = () => {
        this.setState({
            listOfUpdates: {
                listToDelete: [], listToUpdateStatus: []
            }
        })
        this.getListOfMW()
    }
    createNewMW = async () => {
        let name = this.state.newMWName
        let status = this.state.newMWStatus
        let mwInfo = { name, appInfo: { name: 'ztrader', status } }
        if (name !== '') {
            dbHelper.createNewMarketWatch(mwInfo, () => {
                this.getListOfMW()
                this.props.updateListOfMW()
            })
        }
        else {
            M.toast({ html: 'Please fill in the MW name', displayLength: 2000 })
        }
        this.setState({ newMWName: '', newMWStatus: false })
    }
    handleConsoleChange = (e) => {
        if (e.target.name === 'newMWName') {
            this.setState({ newMWName: e.target.value })
        }
        else if (e.target.name === "newMWStatus") {
            this.setState({ newMWStatus: e.target.checked })
        }
    }
    render() {
        let { listOfMW, listOfUpdates, tickerInfo, newMWName } = this.state
        let disableSave = true
        let disableCreate = true
        if ((listOfUpdates.listToDelete.length === 0) && (listOfUpdates.listToUpdateStatus.length === 0)) { disableSave = true }
        else { disableSave = false }
        if (newMWName.length !== 0) { disableCreate = false }
        let textDecoration = (toDelete) => {
            let textDecoration
            if (toDelete === true)
                textDecoration = 'line-through'
            else {
                textDecoration = 'none'
            }
            return textDecoration
        }
        return (
            <div className="left-align">
                <div className="divider"></div>
                <div className="row">
                    <div className="col s6">
                        <h6><b>Manage Existing MWs</b></h6>
                        <div className="row">
                            {listOfMW.length !== 0 ? (
                                <ul className="collection" style={{ overflowY: 'scroll', height: '300px' }}>
                                    <li className="collection-item">
                                        <b>Name</b>
                                        <div style={{ display: 'inline-block', width: '100px', marginLeft: '10px' }} className="right"><b>Action</b></div>
                                        <div style={{ display: 'inline-block', width: '50px', marginLeft: '10px' }} className="right"><b>Status</b></div>
                                    </li>
                                    {listOfMW.map((object, it) => (<li key={it} className="collection-item">
                                        <div style={{ display: 'inline-block', textDecoration: textDecoration(object.toDelete) }}>{object.name}</div>
                                        <div style={{ display: 'inline-block', width: '100px', marginLeft: '10px' }} className="right">
                                            <button className='action-btn' onClick={(e) => this.switchState(e, object)}>
                                                {object.toDelete}<FontAwesomeIcon icon={faTrashAlt}></FontAwesomeIcon>
                                            </button>
                                            <button title="subscribe instruments to live ticker" className="action-btn" onClick={(e) => this.addInstrumentsToTicker(e, object)}>
                                                <FontAwesomeIcon icon={faPlug} ></FontAwesomeIcon>
                                            </button>
                                        </div>
                                        <div style={{ display: 'inline-block', width: '50px', marginLeft: '10px' }} className="right">
                                            <label><input type="checkbox" checked={object.status} onChange={(e) => this.switchStatus(e, object)} /><span></span></label>
                                        </div>
                                    </li>))}
                                </ul>) : (<div> No MW found</div>)}
                            <button disabled={disableSave} onClick={() => { this.onSave() }} className="blue waves-effect waves-light btn-small right"> <FontAwesomeIcon icon={faCloudUploadAlt}></FontAwesomeIcon> Save</button>
                            <button disabled={disableSave} onClick={() => { this.onReset() }} className="blue waves-effect waves-light btn-small right" style={{ marginRight: '5px' }}> <FontAwesomeIcon icon={faSyncAlt}></FontAwesomeIcon> Reset</button>
                        </div>
                    </div>

                    <div className="col s6" style={{ paddingLeft: '30px' }}>
                        <h6><b>Create New MarketWatch</b></h6>
                        <div className="row">
                            <div className="input-field col" style={{ margin: '.5rem 0 0 0' }}>
                                <input onChange={(e) => this.handleConsoleChange(e)} placeholder="Ex. Commodity MW" name="newMWName" id="newMWName" type="text" className="validate" value={this.state.newMWName} />
                            </div>
                            <div className="col inline-block" style={{ margin: '2rem 0 0 0' }}>
                                <label>
                                    <input onChange={(e) => this.handleConsoleChange(e)} name="newMWStatus" type="checkbox" checked={this.state.newMWStatus} />
                                    <span>Active</span>
                                </label>
                            </div>
                            <div className="col s12"><button disabled={disableCreate} onClick={() => this.createNewMW()} className="blue waves-effect waves-light btn-small">Create</button></div>
                        </div>
                        <br />
                        <h6><b>Manage TIcker Subscriptions</b></h6>
                        <div className="row">
                            <ul className="collection">
                                <li className="collection-item">
                                    <b>Name</b>
                                    <div style={{ display: 'inline-block', width: '100px', marginLeft: '10px' }} className="right"><b>Action</b></div>
                                    {/* <div style={{ display: 'inline-block', width: '50px', marginLeft: '10px' }} className="right"><b>Status</b></div> */}
                                    <div style={{ display: 'inline-block', width: '50px', marginLeft: '10px' }} className="right"><b>Size</b></div>
                                </li>
                                {tickerInfo.map((object, it) => {
                                    return (<li key={it} className="collection-item">
                                        <div style={{ display: 'inline-block' }}>Ticker {it + 1}</div>
                                        <div style={{ display: 'inline-block', width: '100px', marginLeft: '10px' }} className="right">
                                            <button className="action-btn" title="Erase ticker list" onClick={(e) => this.purgeTicker(e, it + 1)}><FontAwesomeIcon icon={faBroom}></FontAwesomeIcon></button>
                                            {/* <button className="action-btn" title="Clear garbage instruments" onClick={(e) => this.cleanTicker(e, it)}><FontAwesomeIcon icon={faEraser}></FontAwesomeIcon></button> */}
                                        </div>
                                        {/* <div style={{ display: 'inline-block', width: '50px', marginLeft: '10px' }} className="right"></div> */}
                                        <div style={{ display: 'inline-block', width: '50px', marginLeft: '10px' }} className="right">
                                            {object}
                                        </div>
                                    </li>)
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>)
    }

}

export default ManageMarketWatchPanel
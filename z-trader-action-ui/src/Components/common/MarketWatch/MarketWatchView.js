import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashAlt, faInfoCircle, faLock, faUnlock, faBell
  // faStar as faStarSolid 
} from "@fortawesome/free-solid-svg-icons";
// import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons'
import './mwview.css'
// import M from "materialize-css";
import InstrumentInfoModal from '../InstrumentInfoModal'
var arraySort = require('array-sort');

class MarketWatchView extends Component {
  constructor(props) {
    super(props);
    let { fieldsToDisplay } = this.props
    if (!fieldsToDisplay) { fieldsToDisplay = [] }
    this.state = {
      modalInfo: {},
      promptDelete: true,
      fieldsToDisplay,
      sortingField: 'tradingsymbol',
      reverseSorting: true
    };
  }
  componentDidMount() {
    // M.AutoInit();
  }
  onDelete = (e, instrument) => {
    if (this.state.promptDelete) {
      let confirmation = window.confirm(
        `Are you sure you want to delete ${instrument.tradingsymbol}`
      );
      if (confirmation === true) {
        this.props.onDelete(instrument);
      }
    } else {
      this.props.onDelete(instrument);
    }
  };
  handlePromptDeleteLock = e => {
    const promptDelete = !this.state.promptDelete
    this.setState({ promptDelete })
  }
  handleChartRequest = (e, data) => {
    // console.log(data)
    this.props.onRowSelect(data)
  }
  handleHeaderSelect = (e, accessor) => {
    if (accessor === this.state.sortingField) {
      this.setState({ reverseSorting: !this.state.reverseSorting })
    } else {
      this.setState({ sortingField: accessor, reverseSorting: true })
    }
    // this.sort.sortTable()
  }
  setModalInfo = (e, data) => { this.setState({ modalInfo: data }) }

  createAlert = (e, instrument) => {
    this.props.createAlert(instrument)
  }
  render() {
    let { mwData, connected, nightMode } = this.props;
    let backgroundColor, striped, textColor, iconColor
    // console.log('marketwatchview', nightMode)

    if (nightMode) {
      backgroundColor = "blue-grey darken-4"
      textColor = "cyan-text"
      iconColor = "#00acc1"
    } else {
      backgroundColor = "white"
      textColor = "black-text"
      striped = "striped"
      iconColor = ""
    }

    let { fieldsToDisplay, modalInfo, promptDelete, sortingField, reverseSorting } = this.state
    let trows = [];
    let data = [];
    let theadContent = []

    for (let it in fieldsToDisplay) {
      if (fieldsToDisplay[it].toDisplay) {
        theadContent.push(<th onClick={(e) => this.handleHeaderSelect(e, fieldsToDisplay[it].accessor)}
          key={it} className={fieldsToDisplay[it].className} title={fieldsToDisplay[it].title}
          data-field={fieldsToDisplay[it].accessor}>{fieldsToDisplay[it].label}</th>)
      }
    }

    theadContent.push(<th data-field='info' title="info" key={fieldsToDisplay.length + 1}>
      <FontAwesomeIcon icon={faInfoCircle} />
    </th>)
    theadContent.push(<th data-field='alert' title="create-alert" key={fieldsToDisplay.length + 2}>
      <FontAwesomeIcon icon={faBell} />
    </th>)
    theadContent.push(<th data-field="action" title="delete-lock" key={fieldsToDisplay.length + 3} >
      <div className="lock" title="delete lock">
        <button className="link-button" onClick={this.handlePromptDeleteLock}>
          {promptDelete ? <FontAwesomeIcon color={iconColor} icon={faLock} />
            : <FontAwesomeIcon icon={faUnlock} />}
        </button>
      </div>
    </th>)
    let thead = <thead><tr>{theadContent}</tr></thead>

    for (let i in mwData) {
      data.push({});
      for (let j in fieldsToDisplay) {
        let { accessor } = fieldsToDisplay[j]
        switch (accessor) {
          case 'change':
          case 'spike3min':
          case 'spike10min':
          case 'fluctuation':
          case 'price_zone':
          case 'volume':
            if (mwData[i][accessor] || mwData[i][accessor] === 0) {
              data[i][accessor] = mwData[i][accessor];
            } else { data[i][accessor] = 'NA' }
            break;
          default:
            data[i][accessor] = mwData[i][accessor]
        }
      }
    }
    data = arraySort(data, sortingField, { reverse: reverseSorting })
    for (let i in data) {
      let trowContent = []
      for (let j in fieldsToDisplay) {
        if (fieldsToDisplay[j].toDisplay) {
          trowContent.push(<td onClick={e => this.handleChartRequest(e, data[i])} key={j}>{data[i][fieldsToDisplay[j].accessor]}</td>)
        }
      }

      trowContent.push(<td key={fieldsToDisplay.length + 1}>
        <div className="inline-block" title="info">
          <button data-target="instrument-info-modal" className={`modal-trigger link-button`} onClick={e => this.setModalInfo(e, data[i])}>
            <FontAwesomeIcon color={iconColor} icon={faInfoCircle} />
          </button>
        </div>
      </td>)
      trowContent.push(<td key={fieldsToDisplay.length + 2}>
        <div className="inline-block" title="create-alert">
          <button className={`link-button`} onClick={e => this.createAlert(e, data[i])}>
            <FontAwesomeIcon color={iconColor} icon={faBell} />
          </button>
        </div>
      </td>)
      trowContent.push(<td key={fieldsToDisplay.length + 3}>
        <div className="inline-block" title='trash'>
          <button className="link-button" onClick={e => this.onDelete(e, data[i])}>
            <FontAwesomeIcon color={iconColor} icon={faTrashAlt} />
          </button>
        </div>
      </td>)
      trows.push(<tr key={i}>{trowContent}</tr>);
    }
    return (
      <div className={`row row-no-margin mwv-table-container ${backgroundColor}`}>
        <div className="col s12 no-margin">
          {!connected ? <div className="progress no-margin no-padding">
            <div className="indeterminate"></div>
          </div> : <div></div>}
        </div>
        <div className="col s12 no-padding">
          <table ref="table" className={`responsive-table ${striped} ${textColor}`}>
            {thead}
            <tbody>
              {trows}
              <tr className="fill-space" />
            </tbody>
          </table>
        </div>
        <InstrumentInfoModal id="instrument-info-modal" modalInfo={modalInfo}></InstrumentInfoModal>
      </div>
    );
  }
}

export default MarketWatchView;

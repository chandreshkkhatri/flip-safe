import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashAlt, faInfoCircle, faLock, faUnlock, faCross, faCheckCircle, faExclamationTriangle,
  // faStar as faStarSolid 
} from "@fortawesome/free-solid-svg-icons";
// import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons'
import './mwview.css'
import M from "materialize-css";
import InstrumentInfoModal from './InstrumentInfoModal'
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
    M.AutoInit();
  }
  onDelete = (e, data) => {
    if (this.state.promptDelete) {
      let confirmation = window.confirm(
        `Are you sure you want to delete ${data.tradingsymbol}`
      );
      if (confirmation === true) {
        this.props.onDelete(data);
      }
    } else {
      this.props.onDelete(data);
    }
  };
  handlePromptDeleteLock = e => {
    const promptDelete = !this.state.promptDelete
    this.setState({ promptDelete })
  }
  handleRowSelect = (e, data) => { this.props.onRowSelect(data) }
  handleHeaderSelect = (e, accessor) => {
    if (accessor === this.state.sortingField) {
      this.setState({ reverseSorting: !this.state.reverseSorting })
    } else {
      this.setState({ sortingField: accessor, reverseSorting: true })
    }
    // this.sort.sortTable()
  }
  setModalInfo = (e, data) => { this.setState({ modalInfo: data }) }

  render() {
    let { mwData } = this.props
    let { fieldsToDisplay, modalInfo, promptDelete, sortingField, reverseSorting } = this.state
    let trows = [];
    let data = [];
    let theadContent = []
    // theadContent.push(<th><FontAwesomeIcon icon={faStarSolid} /></th>)
    for (let it in fieldsToDisplay) {
      if (fieldsToDisplay[it].toDisplay) {
        theadContent.push(<th onClick={(e) => this.handleHeaderSelect(e, fieldsToDisplay[it].accessor)}
          key={it} className={fieldsToDisplay[it].className} title={fieldsToDisplay[it].title}
          data-field={fieldsToDisplay[it].accessor}>{fieldsToDisplay[it].label}</th>)
      }
    }
    theadContent.push(<th data-field='info' title="info" key={fieldsToDisplay.length}>
      <FontAwesomeIcon icon={faInfoCircle} />
    </th>)
    theadContent.push(<th data-field="action" title="delete-lock" key={fieldsToDisplay.length + 1} >
      <div className="lock" title="delete lock">
        <button onClick={this.handlePromptDeleteLock}>
          {promptDelete ? <FontAwesomeIcon icon={faLock} />
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
          case 'status':
            // console.log(mwData[i][accessor])
            if (mwData[i][accessor]) {
              data[i][accessor] = <FontAwesomeIcon icon={faCheckCircle} color="green" />
            } else {
              data[i][accessor] = <FontAwesomeIcon icon={faExclamationTriangle} color="red" />
            }
            break;
          default:
            data[i][accessor] = mwData[i][accessor]
        }
      }
    }
    data = arraySort(data, sortingField, { reverse: reverseSorting })
    for (let i in data) {
      let trowContent = []
      // trowContent.push(<td><FontAwesomeIcon icon={faStarRegular} /></td>)
      for (let j in fieldsToDisplay) {
        if (fieldsToDisplay[j].toDisplay) {
          trowContent.push(<td key={j}>{data[i][fieldsToDisplay[j].accessor]}</td>)
        }
      }
      trowContent.push(<td key={fieldsToDisplay.length}>
        <div className="inline-block" title="info">
          <button data-target="instrument-info-modal" className="modal-trigger" onClick={e => this.setModalInfo(e, data[i])}>
            <FontAwesomeIcon icon={faInfoCircle} />
          </button>
        </div>
      </td>)
      trowContent.push(<td key={fieldsToDisplay.length + 1}>
        <div className="inline-block" title='trash'>
          <button onClick={e => this.onDelete(e, data[i])}>
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
        </div>
      </td>)
      trows.push(<tr key={i} onClick={e => this.handleRowSelect(e, data[i])} style={{ cursor: "pointer" }}>{trowContent}</tr>);
    }
    return (
      <div className="row row-no-margin  mwv-table-container">
        <div className="col s12 no-margin">
          <table ref="table" className="striped responsive-table">
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

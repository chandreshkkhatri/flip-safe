import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashAlt,
  faCloudUploadAlt,
  faSyncAlt
} from "@fortawesome/free-solid-svg-icons";
import M from "materialize-css/dist/js/materialize";
import axios from "axios";
import { getListOfMW } from "../../utils/db-queries";

class MWConsole extends Component {
  constructor() {
    super();
    this.state = {
      listOfMW: [],
      listOfUpdates: {
        listToDelete: [],
        listToUpdateStatus: []
      },
      newMWName: "",
      newMWStatus: false
    };
  }
  componentWillMount() {
    this.setListOfMW();
  }
  componentDidMount() {
    M.AutoInit();
  }
  setListOfMW = async () => {
    getListOfMW()
      .then(res => {
        let listOfMW = res;
        this.setState({ listOfMW });
      })
      .catch(err => console.log(err));
  };
  switchStatus = (e, object) => {
    let mwName = object.name;
    let listOfMW = this.state.listOfMW;
    let listOfUpdates = this.state.listOfUpdates;
    let listToUpdateStatus = listOfUpdates.listToUpdateStatus;
    for (let it in listOfMW) {
      if (listOfMW[it].name === mwName) {
        listOfMW[it]["status"] = e.target.checked;
        let flag = true;
        for (let it1 in listToUpdateStatus) {
          if (listToUpdateStatus[it1].name === mwName) {
            flag = false;
            listToUpdateStatus.splice(it1, 1);
          }
        }
        if (flag) {
          listToUpdateStatus.push(listOfMW[it]);
        }
      }
    }
    listOfUpdates.listToUpdateStatus = listToUpdateStatus;
    this.setState({ listOfMW, listOfUpdates });
  };
  switchState = (e, object) => {
    let mwName = object.name;
    let listOfMW = this.state.listOfMW;
    let listOfUpdates = this.state.listOfUpdates;
    let listToDelete = listOfUpdates.listToDelete;
    for (let it in listOfMW) {
      if (listOfMW[it]["name"] === mwName) {
        if (listOfMW[it]["toDelete"] === true) {
          for (let it1 in listToDelete) {
            if (listToDelete[it1].name === listOfMW[it].name) {
              listToDelete.splice(it1, 1);
            }
          }
          listOfMW[it]["toDelete"] = false;
        } else {
          listOfMW[it]["toDelete"] = true;
          listToDelete.push(listOfMW[it]);
        }
      }
    }
    listOfUpdates.listToDelete = listToDelete;
    this.setState({ listOfMW, listOfUpdates });
  };
  onSave = async () => {
    let listOfUpdates = {
      listOfUpdates: this.state.listOfUpdates,
      appName: "zdashboard"
    };
    await axios
      .post(`http://localhost:3000/db/update-mw-info`, listOfUpdates)
      .then(async res => {
        this.setState({
          listOfUpdates: {
            listToDelete: [],
            listToUpdateStatus: []
          },
          newMWName: "",
          newMWStatus: false
        });
        this.setListOfMW();
        this.props.updateListOfMW();
      })
      .catch(err => console.log(err));
  };
  onReset = () => {
    this.setState({
      listOfUpdates: {
        listToDelete: [],
        listToUpdateStatus: []
      }
    });
    this.setListOfMW();
  };
  createNewMW = async () => {
    let name = this.state.newMWName;
    let status = this.state.newMWStatus;
    let mwInfo = { name, appInfo: { name: "zdashboard", status } };
    if (name !== "") {
      await axios.post(`http://localhost:3000/db/create-new-mw`, { mwInfo })
        .then(async res => {
          this.setListOfMW();
          this.props.updateListOfMW();
        })
        .catch(err => console.log(err));
    } else {
      M.toast({ html: "Please fill in the MW name", displayLength: 2000 });
    }
    this.setState({ newMWName: "", newMWStatus: false });
  };
  handleConsoleChange = e => {
    if (e.target.name === "newMWName") {
      this.setState({ newMWName: e.target.value });
    } else if (e.target.name === "newMWStatus") {
      this.setState({ newMWStatus: e.target.checked });
    }
  };

  render() {
    let { listOfMW, listOfUpdates } = this.state;
    let disableSave = true;
    if (
      listOfUpdates.listToDelete.length === 0 &&
      listOfUpdates.listToUpdateStatus.length === 0
    ) {
      disableSave = true;
    } else {
      disableSave = false;
    }
    let textDecoration = toDelete => {
      let textDecoration;
      if (toDelete === true) textDecoration = "line-through";
      else {
        textDecoration = "none";
      }
      return textDecoration;
    };
    return (
      <div className="left-align">
        <div className="divider" />
        <div className="row">
          <div className="col s6">
            <h6>
              <b>Manage Existing MWs</b>
            </h6>
            <div className="row">
              {listOfMW.length !== 0 ? (
                <ul
                  className="collection"
                  style={{ overflowY: "scroll", height: "300px" }}
                >
                  <li className="collection-item">
                    <b>Name</b>
                    <div
                      style={{
                        display: "inline-block",
                        width: "50px",
                        marginLeft: "10px"
                      }}
                      className="right"
                    >
                      <b>Action</b>
                    </div>
                    <div
                      style={{
                        display: "inline-block",
                        width: "50px",
                        marginLeft: "10px"
                      }}
                      className="right"
                    >
                      <b>Status</b>
                    </div>
                  </li>
                  {listOfMW.map((object, it) => (
                    <li key={it} className="collection-item">
                      <div
                        style={{
                          display: "inline-block",
                          textDecoration: textDecoration(object.toDelete)
                        }}
                      >
                        {object.name}
                      </div>
                      <div
                        style={{
                          display: "inline-block",
                          width: "50px",
                          marginLeft: "10px"
                        }}
                        className="right"
                      >
                        <button
                          action="delete"
                          onClick={e => this.switchState(e, object)}
                        >
                          {object.toDelete}
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                      </div>
                      <div
                        style={{
                          display: "inline-block",
                          width: "50px",
                          marginLeft: "10px"
                        }}
                        className="right"
                      >
                        <label>
                          <input
                            type="checkbox"
                            checked={object.status}
                            onChange={e => this.switchStatus(e, object)}
                          />
                          <span />
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                  <div> No MW found</div>
                )}
              <button
                disabled={disableSave}
                onClick={() => {
                  this.onSave();
                }}
                className="blue waves-effect waves-light btn-small right"
              >
                {" "}
                <FontAwesomeIcon icon={faCloudUploadAlt} /> Save
              </button>
              <button
                disabled={disableSave}
                onClick={() => {
                  this.onReset();
                }}
                className="blue waves-effect waves-light btn-small right"
                style={{ marginRight: "5px" }}
              >
                {" "}
                <FontAwesomeIcon icon={faSyncAlt} /> Reset
              </button>
            </div>
          </div>

          <div className="col s5 offset-s1 border-right">
            <h6>
              <b>Create New MarketWatch</b>
            </h6>
            <div className="input-field col">
              <input
                onChange={e => this.handleConsoleChange(e)}
                placeholder="Ex. Commodity MW"
                name="newMWName"
                id="newMWName"
                type="text"
                className="validate"
                value={this.state.newMWName}
              />
            </div>
            <div className="shift-down-3rem">
              <label>
                <input
                  onChange={e => this.handleConsoleChange(e)}
                  name="newMWStatus"
                  type="checkbox"
                  checked={this.state.newMWStatus}
                />
                <span>Active</span>
              </label>
            </div>
            <br />
            <button
              onClick={() => this.createNewMW()}
              className="blue col waves-effect waves-light btn-small"
            >
              Create new MW
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default MWConsole;

import React from "react";
import DataControllerOperations from "../../services/DataControllerOperations";
import pendingIcon from "../../pending.png";
import approvedIcon from "../../approved.png";
import rejectedIcon from "../../rejected.png";
import queuedIcon from "../../queued.png";
import DataControllerCredentialSubjectView from "../dataController/DataControllerCredentialSubjectView";
import DarkenOverlay from "./DarkenOverlay";
import AgentOperations from "../../services/AgentOperations";

class DataAgentLoginModal extends React.Component {
  constructor() {
    super();
    this.usernameRef = React.createRef();
    this.passwordRef = React.createRef();
    this.checkBoxRef = React.createRef();
    this.state = {
      associatedData: null,
      checkAlerts: false,
      selectedOption: 0,
      isModify: false,
      isDelete: false,
      editableData: {},
      showSubjectPopup: false,
      comparisonItem: null,
    };
  }

  componentDidMount() {
    this.setState({ userData: this.props.userData });
  }

  formatKeyLabel = (key) => {
    return key
      .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase → camel Case
      .replace(/_/g, " ") // snake_case → snake case
      .replace(/\./g, " → ") // nested keys (orgStatus.code)
      .replace(/^./, (str) => str.toUpperCase());
  };

  handleOnAlertClicked = (event) => {
    event.preventDefault();
    const payload = {
      dcCode: this.state.userData?.id,
    };

    DataControllerOperations.requestAssociatedDataSubjectsWithOrganization(
      payload,
    )
      .then((response) => {
        console.log("Agent Associated Data Fetched :", response?.data);

        this.setState({
          checkAlerts: !this.state.checkAlerts,
          associatedData: response?.data?.data,
        });
      })
      .catch((error) => {
        console.error(
          "Agent Associated Data Fetched failed:",
          error.response || error,
        );
        alert(
          error.response?.data?.message ||
            "Agent Fetching failed. Please try again.",
        );
      });
  };

  handleOrgChange = (event) => {
    const selectedOption = Number(event.target.value);
    this.setState({
      selectedOption,
    });
  };

  handleFieldChange = (key, value) => {
    this.setState((prevState) => ({
      editableData: {
        ...prevState.editableData,
        [key]: value,
      },
    }));
  };

  handleProceedSubmit = (userData) => (event) => {
    event.preventDefault();
    const { selectedOption } = this.state;

    if (selectedOption === 1) {
      this.setState({ isModify: true, isDelete: false });
    } else if (selectedOption === 2) {
      this.setState({ isModify: false, isDelete: true });
    } else {
      return;
    }

    const editableData = {
      "Agent Username": userData?.username ?? "",
      "Agent Password": userData?.password ?? "",
      "Agent Status": userData?.status?.description ?? "",
      Organization: userData?.dataController?.orgName ?? "",
      Notifications: userData?.notifications ?? "",
    };

    this.setState({ editableData });
  };

  handleModification = (userData) => (event) => {
    event.preventDefault();
    const payload = {
      orgUsername: this.state.editableData["Agent Username"],
      orgPassword: this.state.editableData["Agent Password"],
      agentId: userData?.id,
    };
    console.log("Payload to backend:", payload);

    AgentOperations.UpdateAgentData(payload)
      .then((response) => {
        console.log("Modification success:", response.data);

        AgentOperations.FetchAgentInformation(payload)
          .then((response) => {
            console.log("Fetching success:", response.data);

            this.setState({
              userData: response.data?.data,
            });
          })
          .catch((error) => {
            alert(
              error.response?.data?.message ||
                "Data Fetching Went Wrong. Please try again.",
            );
          });
      })
      .catch((error) => {
        console.error("Modification failed:", error.response || error);
        alert(
          error.response?.data?.message ||
            "Modification failed. Please try again.",
        );
      });

    this.setState({
      isModify: false,
      isDelete: false,
      editableData: {},
    });
  };

  handleOnSubmitDelete = (event) => {
    event.preventDefault();
    if (!this.state.deleteConfirmed) {
      alert("Please confirm the risk before deleting your data.");
      return;
    }

    console.log("Deleting data...");

    const payload = {
      agentId: this.state.userData?.id,
      status: 2,
    };

    AgentOperations.DeactivateAgentrecord(payload)
      .then((response) => {
        alert("Agent Data Deleted Successfully.");
        console.log("Deletion success:", response.data);
        this.setState({
          associatedData: null,
          checkAlerts: false,
          selectedOption: 0,
          isModify: false,
          isDelete: false,
          editableData: {},
          userData: null,
        });
      })
      .catch((error) => {
        console.error("Deletion failed:", error.response || error);
        alert(
          error.response?.data?.message || "Deletion failed. Please try again.",
        );
      });

    this.setState({
      isModify: false,
      isDelete: false,
      editableData: {},
      deleteConfirmed: false,
    });
  };

  resetModifySection = (event) => {
    event.preventDefault();
    this.setState({ isModify: false, isDelete: false });
  };

  fetchUniqueDataOfCustomer = (item) => {
    switch (item.dcCode?.identificationKey?.code) {
      case "NIC":
        return item.dsCode?.nicNumber;

      case "MOB":
        return item.dsCode?.mobileNumber;

      case "EMAIL":
        return item.dsCode?.emailAddress;

      case "CUSTID":
        return item.dsCode?.customerId;

      default:
        return null;
    }
  };

  fetchIconForActivityStatus = (item) => {
    switch (item.activityStatus?.code) {
      case "PEND":
        return (
          <img
            className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-action-fetchIconForActivity"
            src={pendingIcon}
            alt="Pending"
          />
        );

      case "APPR":
        return (
          <img
            className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-action-fetchIconForActivity"
            src={approvedIcon}
            alt="Approved"
          />
        );

      case "REJC":
        return (
          <img
            className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-action-fetchIconForActivity"
            src={rejectedIcon}
            alt="Rejected"
          />
        );

      case "QUEU":
        return (
          <img
            className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-action-fetchIconForActivity"
            src={queuedIcon}
            alt="Queued"
          />
        );

      case "SKIP":
        return (
          <img
            className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-action-fetchIconForActivity"
            src={queuedIcon}
            alt="Skipped"
          />
        );
      default:
        return null;
    }
  };

  fetchClassNameFromActivityStatus = (item) => {
    switch (item.activityStatus?.code) {
      case "PEND":
        return "data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-pending";

      case "APPR":
        return "data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-approved";

      case "REJC":
        return "data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-rejected";

      case "QUEU":
        return "data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-queued";

      case "SKIP":
        return "data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-skipped";
      default:
        return null;
    }
  };

  flattenObject = (obj, parentKey = "", result = {}) => {
    Object.entries(obj).forEach(([key, value]) => {
      const newKey = parentKey ? `${parentKey}.${key}` : key;

      if (typeof value === "object" && value !== null) {
        this.flattenObject(value, newKey, result);
      } else {
        result[newKey] = value;
      }
    });

    return result;
  };

  handleSubjectCardClick = (item) => {
    console.log("Subject card clicked:", item);

    if (item.adminActivityStatus?.code === "APPR") {
      return alert("Already Approved By Admin");
    }
    if (item.adminActivityStatus?.code === "REJC") {
      return alert("Already Rejected By Admin");
    }
    const flatOld = this.flattenObject(JSON.parse(item.backupData || "{}"));
    const flatNew = this.flattenObject(JSON.parse(item.collectedData || "{}"));

    const allKeys = Array.from(
      new Set([...Object.keys(flatOld), ...Object.keys(flatNew)]),
    );

    const comparisonRows = allKeys.map((key) => {
      const oldValue = flatOld[key] ?? "";
      const newValue = flatNew[key] ?? "";
      const isChanged = String(oldValue) !== String(newValue);

      return {
        key,
        oldValue,
        newValue,
        isChanged,
      };
    });

    this.setState({
      comparisonItem: comparisonRows,
      checkAlerts: false,
      selectedSubject: item,
      showSubjectPopup: true,
    });
  };

  render() {
    const userData = this.state.userData;
    return (
      <>
        <div
          className="data-controller-profile-result-div-middle"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="data-controller-profile-result-div-middle-1"></div>
          <div className="data-controller-profile-result-div-middle-2">
            <div className="data-controller-profile-result-div-middle-2-top">
              <div className="data-controller-profile-result-div-middle-2-top-image notification-wrapper">
                <span
                  className="notification-bell"
                  onClick={(e) => {
                    e.stopPropagation();
                    this.handleOnAlertClicked(e);
                  }}
                >
                  🔔
                </span>

                {100 > userData?.notifications && (
                  <span className="notification-badge">
                    {userData?.notifications}
                  </span>
                )}

                {userData?.notifications > 100 && (
                  <span className="notification-badge">100+</span>
                )}
              </div>
              <div className="data-controller-profile-result-div-middle-2-top-name">
                Welcome,
                <br />
                {userData
                  ? ` ${userData?.dataController?.orgName} (Agent)`
                  : ""}
              </div>
            </div>
            <div className="data-controller-profile-result-div-middle-2-middle">
              <div className="data-controller-profile-result-div-middle-2-middle-center">
                <span>
                  Hi there, please find the illustrated data related for your
                  organization and its related subjects. Make sure to
                  continuously observe for customer requests and also check with
                  your email as well.
                </span>
              </div>
            </div>
            <div className="data-controller-profile-result-div-middle-2-bottom">
              <button className="data-controller-profile-result-div-middle-2-bottom-btn">
                Log out
              </button>
            </div>
          </div>
          <div className="data-controller-profile-result-div-middle-3"></div>
          <div className="data-controller-profile-result-div-middle-4">
            <div className="data-controller-profile-result-div-middle-4-top">
              <h1>Agent Credentials</h1>
              {userData && (
                <table className="data-controller-profile-result-div-middle-4-top-data-table">
                  <tbody>
                    {[
                      { key: "Agent Username", value: userData?.username },
                      { key: "Agent Password", value: userData?.password },
                      {
                        key: "Agent Status",
                        value: userData?.status?.description,
                      },
                      { key: "Agent Role", value: userData?.userRole?.role },
                      {
                        key: "Organization",
                        value: userData?.dataController?.orgName,
                      },
                      { key: "Notifications", value: userData?.notifications },
                    ].map(({ key, value }, index) => (
                      <tr key={index}>
                        <td className="data-controller-profile-result-div-middle-4-top-data-table-key-cell">
                          {this.formatKeyLabel(key)}
                        </td>
                        <td className="data-controller-profile-result-div-middle-4-top-data-table-colon-cell">
                          :
                        </td>
                        <td className="data-controller-profile-result-div-middle-4-top-data-table-value-cell">
                          <input
                            className="value-input"
                            type="text"
                            value={value ?? ""}
                            readOnly
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="data-controller-profile-result-div-middle-4-bottom">
              <form
                className="data-controller-profile-result-div-middle-4-bottom-form"
                onSubmit={this.handleProceedSubmit(userData)}
              >
                <select
                  className="data-controller-profile-result-div-middle-4-bottom-dropdown"
                  onChange={this.handleOrgChange}
                >
                  <option value="0">Select An Option</option>
                  <option value="1">Modify Data</option>
                  <option value="2">Delete Data</option>
                </select>
                <input
                  className="data-controller-profile-result-div-middle-4-bottom-btn"
                  type="submit"
                  value="Proceed"
                  disabled={this.state.selectedOption === 0}
                />
              </form>
            </div>
          </div>
          <div className="data-controller-profile-result-div-middle-5"></div>

          <DarkenOverlay
            isDelete={this.state.isDelete}
            isModify={this.state.isModify}
            checkAlerts={this.state.checkAlerts}
          />

          <div
            className={`data-controller-profile-popup-div ${
              this.state.isModify ? "active" : ""
            }`}
          >
            <>
              <div className="data-controller-profile-popup-div-top-outer">
                <h3>Modify Agent Data</h3>
              </div>
              <div className="data-controller-profile-popup-div-middle-outer">
                {userData && (
                  <table className="data-controller-profile-popup-div-middle-data-table">
                    <tbody>
                      {[
                        { key: "Agent Username", value: userData?.username },
                        { key: "Agent Password", value: userData?.password },
                        {
                          key: "Agent Status",
                          value: userData?.status?.description,
                        },
                        {
                          key: "Agent Role",
                          value: userData?.userRole?.role,
                        },
                        {
                          key: "Organization",
                          value: userData?.dataController?.orgName,
                        },
                        {
                          key: "Notifications",
                          value: userData?.notifications,
                        },
                      ].map(({ key, value }, index) => (
                        <tr key={index}>
                          <td className="data-controller-profile-popup-div-middle-data-table-key-cell">
                            {this.formatKeyLabel(key)}
                          </td>
                          <td className="data-controller-profile-popup-div-middle-data-table-colon-cell">
                            :
                          </td>
                          <td className="data-controller-profile-popup-div-middle-data-table-value-cell">
                            <input
                              className="value-input"
                              type="text"
                              value={this.state.editableData[`${key}`] || ""}
                              onChange={(e) =>
                                this.handleFieldChange(`${key}`, e.target.value)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="data-controller-profile-popup-div-bottom-outer">
                <form
                  onSubmit={this.handleModification(userData)}
                  className="data-controller-profile-popup-div-bottom-outer-form"
                >
                  <button
                    type="button"
                    className="data-controller-profile-popup-div-bottom-outer-form-btn"
                    onClick={this.resetModifySection}
                  >
                    Cancel
                  </button>
                  <input
                    type="submit"
                    value="Modify"
                    className="data-controller-profile-popup-div-bottom-outer-form-btn"
                  />
                </form>
              </div>
            </>
          </div>

          <div
            className={`data-controller-profile-delete-popup ${
              this.state.isDelete ? "active" : ""
            }`}
          >
            <form
              className="data-controller-profile-delete-popup-active-form"
              onSubmit={this.handleOnSubmitDelete}
            >
              <h1>Confirmation Form</h1>
              <p>
                Dear Agent, Are you sure to delete your information from{" "}
                {userData?.dataController?.lastUpdatedTime}? Please note that
                this approach is not reversible at any costs. Therefore, make
                sure to proceed at you own risk. And check the below box to
                accept the risk and continue on data erasing procedure.
              </p>
              <div className="data-controller-profile-delete-popup-active-form-div-checkbox">
                <input
                  className="data-controller-profile-delete-popup-active-form-div-checkbox-1"
                  type="checkbox"
                  checked={this.state.deleteConfirmed}
                  onChange={(e) =>
                    this.setState({ deleteConfirmed: e.target.checked })
                  }
                  required
                />
                <label>I am proceeding to delete my data at my own risk</label>
              </div>
              <div className="data-controller-profile-delete-popup-active-form-div-buttons">
                <button
                  className="data-controller-profile-delete-popup-active-form-div-buttons-btn"
                  type="button"
                  onClick={this.resetModifySection}
                >
                  Abort Deletion
                </button>
                <input
                  className="data-controller-profile-delete-popup-active-form-div-buttons-btn"
                  type="submit"
                  value="Delete"
                />
              </div>
            </form>
          </div>

          <div
            className={`data-controller-profile-data-subjects-alert-div ${
              this.state.checkAlerts ? "active" : ""
            }`}
          >
            <div className="data-controller-profile-data-subjects-alert-div-top-outer">
              <form className="data-controller-profile-data-subjects-alert-div-top-outer-form">
                <input
                  type="text"
                  placeholder="Search data subject by name"
                  className="data-controller-profile-data-subjects-alert-div-top-outer-form-search-field"
                />
                <input
                  type="submit"
                  value="Search"
                  className="data-controller-profile-data-subjects-alert-div-top-outer-form-search-btn"
                />

                <button
                  type="button"
                  className="data-controller-profile-data-subjects-alert-div-top-outer-form-cancel-btn"
                  onClick={() => this.setState({ checkAlerts: false })}
                >
                  cancel
                </button>
              </form>
            </div>

            <div className="data-controller-profile-data-subjects-alert-div-middle-outer">
              {this.state.associatedData &&
                this.state.associatedData.map((item) => (
                  <div
                    key={item.id}
                    className={this.fetchClassNameFromActivityStatus(item)}
                    onClick={(e) => {
                      e.stopPropagation();
                      this.handleSubjectCardClick(item);
                    }}
                  >
                    <div className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-field-name">
                      {item.dsCode?.firstName} {item.dsCode?.lastName}
                    </div>

                    <div className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-ds-unique">
                      {this.fetchUniqueDataOfCustomer(item)}
                    </div>

                    <div className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-activity-status">
                      {this.fetchIconForActivityStatus(item)}
                    </div>

                    <div className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-action">
                      <select
                        defaultValue={item.activityStatus?.code}
                        className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-action-dropdown"
                      >
                        <option value="PEND">Pending</option>
                        <option value="APPR">Approved</option>
                        <option value="REJC">Rejected</option>
                        <option value="QUEU">Queued</option>
                        <option value="SKIP">Skipped</option>
                      </select>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          {this.state.showSubjectPopup && this.state.comparisonItem && (
            <DataControllerCredentialSubjectView
              comparisonItem={this.state.comparisonItem}
              selectedSubject={this.state.selectedSubject}
              data={this.state.selectedSubject}
              onClose={() =>
                this.setState({
                  showSubjectPopup: false,
                  selectedSubject: null,
                  comparisonItem: null,
                })
              }
            />
          )}
        </div>
      </>
    );
  }
}

export default DataAgentLoginModal;

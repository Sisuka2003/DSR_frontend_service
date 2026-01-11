import React from "react";
import LoginService from "../../services/LoginService";
import DataControllerOperations from "../../services/DataControllerOperations";
import pendingIcon from "../../pending.png";
import approvedIcon from "../../approved.png";
import rejectedIcon from "../../rejected.png";
import queuedIcon from "../../queued.png";
import DataControllerCredentialSubjectView from "../dataController/DataControllerCredentialSubjectView";

class DataControllerLoginModal extends React.Component {
  constructor() {
    super();
    this.usernameRef = React.createRef();
    this.passwordRef = React.createRef();
    this.state = {
      selectedOption: 0,
      isControllerLoginSuccess: false,
      controllerData: null,
      isModify: false,
      isDelete: false,
      deleteConfirmed: false,
      editableData: {},
      internalControllerData: null,
      notificationCount: 3,
      checkAlerts: false,
      associatedData: null,
      selectedSubject: null,
      showSubjectPopup: false,
      comparisonItem: null,
    };
  }

  handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      orgUsername: this.usernameRef.current.value,
      orgPassword: this.passwordRef.current.value,
    };

    LoginService.LoginDataController(payload)
      .then((response) => {
        console.log("Login success 01:", response.data.data);

        this.setState({
          isControllerLoginSuccess: true,
          controllerData: response.data.data,
        });
      })
      .catch((error) => {
        console.error("Login failed:", error.response || error);
        alert(
          error.response?.data?.message || "Login failed. Please try again."
        );
      });
  };
  formatKeyLabel = (key) => {
    return key
      .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase → camel Case
      .replace(/_/g, " ") // snake_case → snake case
      .replace(/\./g, " → ") // nested keys (orgStatus.code)
      .replace(/^./, (str) => str.toUpperCase());
  };

  handleOrgChange = (event) => {
    const selectedOption = Number(event.target.value);
    this.setState({
      selectedOption,
    });
  };

  handleProceedSubmit = (event) => {
    event.preventDefault();
    console.log("ioncec");
    const { selectedOption, controllerData } = this.state;

    if (selectedOption === 1) {
      this.setState({ isModify: true, isDelete: false });
    } else if (selectedOption === 2) {
      this.setState({ isModify: false, isDelete: true });
    } else {
      return;
    }

    const editableData = {};

    Object.entries(controllerData).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        // nested object (orgStatus, identificationKey)
        Object.entries(value).forEach(([subKey, subValue]) => {
          editableData[`${key}.${subKey}`] = subValue;
        });
      } else {
        // primitive values
        editableData[key] = value;
      }
    });

    this.setState({ editableData });
  };

  handleFieldChange = (key, value) => {
    this.setState((prevState) => ({
      editableData: {
        ...prevState.editableData,
        [key]: value,
      },
    }));
  };

  handleModification = (event) => {
    event.preventDefault();
    const payload = {
      username: this.state.editableData?.orgUsername,
      password: this.state.editableData?.orgPassword,
      dcCode: this.state.editableData?.id,
    };
    console.log("Payload to backend:", payload);

    DataControllerOperations.modifyDataControllerData(payload)
      .then((response) => {
        console.log("Modification success:", response.data);

        DataControllerOperations.requestDataControllerData(payload)
          .then((response) => {
            console.log("Fetching success:", response.data);
            const updatedControllerData = response.data?.data;
            if (updatedControllerData) {
              this.setState({
                editableData: {},
                internalControllerData: updatedControllerData,
              });
            }
          })
          .catch((error) => {
            alert(
              error.response?.data?.message ||
                "Data Fetching Went Wrong. Please try again."
            );
          });
      })
      .catch((error) => {
        console.error("Modification failed:", error.response || error);
        alert(
          error.response?.data?.message ||
            "Modification failed. Please try again."
        );
      });

    this.setState({
      isModify: false,
      isDelete: false,
      editableData: {},
    });
  };

  resetModifySection = (event) => {
    event.preventDefault();
    this.setState({ isModify: false, isDelete: false });
  };

  handleOnSubmitDelete = (event) => {
    event.preventDefault();
    if (!this.state.deleteConfirmed) {
      alert("Please confirm the risk before deleting your data.");
      return;
    }

    console.log("Deleting data...");

    const payload = {
      dcCode: this.state.controllerData?.id,
      status: "2",
    };

    DataControllerOperations.deleteDataControllerData(payload)
      .then((response) => {
        alert("Controller Data Deleted Successfully.");
        console.log("Deletion success:", response.data);
        this.setState({
          selectedOption: 0,
          isControllerLoginSuccess: false,
          controllerData: null,
          isModify: false,
          isDelete: false,
          deleteConfirmed: false,
          editableData: {},
          internalControllerData: null,
        });
      })
      .catch((error) => {
        console.error("Deletion failed:", error.response || error);
        alert(
          error.response?.data?.message || "Deletion failed. Please try again."
        );
      });

    this.setState({
      isModify: false,
      isDelete: false,
      editableData: {},
      deleteConfirmed: false,
    });
  };

  handleOnAlertClicked = (event) => {
    event.preventDefault();
    const payload = {
      dcCode: this.state.controllerData?.id,
    };

    DataControllerOperations.requestAssociatedDataSubjectsWithOrganization(
      payload
    )
      .then((response) => {
        console.log("Associated Data Fetched :", response?.data);

        this.setState({
          checkAlerts: !this.state.checkAlerts,
          associatedData: response.data.data,
        });
      })
      .catch((error) => {
        console.error(
          "Associated Data Fetched failed:",
          error.response || error
        );
        alert(
          error.response?.data?.message || "Fetching failed. Please try again."
        );
      });
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
    try {
      if (item.activityStatus?.code === "APPR") {
        return alert("Already Approved");
      }
      if (item.activityStatus?.code === "REJC") {
        return alert("Already Rejected");
      }

      const flatOld = this.flattenObject(JSON.parse(item.backupData || "{}"));
      const flatNew = this.flattenObject(
        JSON.parse(item.collectedData || "{}")
      );

      const allKeys = Array.from(
        new Set([...Object.keys(flatOld), ...Object.keys(flatNew)])
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
    } catch (e) {
      console.error("JSON parse error", e);
      alert("Invalid data format");
    }
  };

  render() {
    const controllerDataToDisplay =
      this.state.internalControllerData || this.state.controllerData;
    return (
      <>
        <form
          className={`dashboard-div-popup-container ${
            this.state.isControllerLoginSuccess ? "deactive" : ""
          }`}
          onClick={(e) => e.stopPropagation()}
          onSubmit={this.handleSubmit}
        >
          <h1>Sign In</h1>
          <input
            ref={this.usernameRef}
            className="dashboard-div-popup-container-form-input-username"
            type="text"
            placeholder="Please Enter Your Username"
            required
          />
          <input
            ref={this.passwordRef}
            className="dashboard-div-popup-container-form-input-password"
            type="password"
            placeholder="Please Enter Your Password"
            required
          />
          <input
            className="dashboard-div-popup-container-credentials-form-submit"
            type="submit"
            value="Login"
          />
        </form>

        {this.state.isControllerLoginSuccess && (
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

                  {100 > controllerDataToDisplay?.notifications && (
                    <span className="notification-badge">
                      {controllerDataToDisplay?.notifications}
                    </span>
                  )}

                  {controllerDataToDisplay?.notifications > 100 && (
                    <span className="notification-badge">100+</span>
                  )}
                </div>
                <div className="data-controller-profile-result-div-middle-2-top-name">
                  Welcome
                  {controllerDataToDisplay
                    ? `, ${controllerDataToDisplay?.orgName}`
                    : ""}
                </div>
              </div>
              <div className="data-controller-profile-result-div-middle-2-middle">
                <div className="data-controller-profile-result-div-middle-2-middle-center">
                  <span>
                    Hi there, please find the illustrated data related for your
                    organization and its related subjects. Make sure to
                    continuously observe for customer requests and also check
                    with your email as well.
                  </span>
                </div>
              </div>
              <div className="data-controller-profile-result-div-middle-2-bottom">
                <button className="data-controller-profile-result-div-middle-2-bottom-btn">
                  Download PDF
                </button>
              </div>
            </div>
            <div className="data-controller-profile-result-div-middle-3"></div>
            <div className="data-controller-profile-result-div-middle-4">
              <div className="data-controller-profile-result-div-middle-4-top">
                <h1>Organizational Information</h1>
                {controllerDataToDisplay &&
                  (() => {
                    const parsedData = controllerDataToDisplay;

                    const rows = Object.entries(controllerDataToDisplay)
                      .filter(
                        ([key]) =>
                          typeof controllerDataToDisplay[key] !== "object"
                      ) // simple fields
                      .map(([key, value]) => ({ key, value }));

                    return (
                      <>
                        <table className="data-controller-profile-result-div-middle-4-top-data-table">
                          <tbody>
                            {rows.map(({ key, value }, index) => (
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
                                    value={String(value)}
                                    readOnly
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    );
                  })()}
              </div>
              <div className="data-controller-profile-result-div-middle-4-bottom">
                <form
                  className="data-controller-profile-result-div-middle-4-bottom-form"
                  onSubmit={this.handleProceedSubmit}
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

            <div
              className={`data-controller-profile-overlay ${
                this.state.isModify ||
                this.state.isDelete ||
                this.state.checkAlerts
                  ? "active"
                  : ""
              }`}
            />

            <div
              className={`data-controller-profile-popup-div ${
                this.state.isModify ? "active" : ""
              }`}
            >
              {controllerDataToDisplay &&
                (() => {
                  const parsedData = controllerDataToDisplay;

                  const rows = Object.entries(controllerDataToDisplay)
                    .filter(
                      ([key]) =>
                        typeof controllerDataToDisplay[key] !== "object"
                    ) // simple fields
                    .map(([key, value]) => ({ key, value }));
                  return (
                    <>
                      <div className="data-controller-profile-popup-div-top-outer">
                        <h3>Modify Organizational Data</h3>
                      </div>
                      <div className="data-controller-profile-popup-div-middle-outer">
                        <table className="data-controller-profile-popup-div-middle-data-table">
                          <tbody>
                            {rows.map(({ key, value }, index) => (
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
                                    value={
                                      this.state.editableData[`${key}`] || ""
                                    }
                                    onChange={(e) =>
                                      this.handleFieldChange(
                                        `${key}`,
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="data-controller-profile-popup-div-bottom-outer">
                        <form
                          onSubmit={this.handleModification}
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
                  );
                })()}
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
                  Dear Controller, Are you sure to delete your information from{" "}
                  {controllerDataToDisplay?.lastUpdatedTime}? Please note that
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
                  <label>
                    I am proceeding to delete my data at my own risk
                  </label>
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
        )}
      </>
    );
  }
}

export default DataControllerLoginModal;

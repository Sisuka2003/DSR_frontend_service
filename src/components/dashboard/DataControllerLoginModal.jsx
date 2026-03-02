import React from "react";
import LoginService from "../../services/LoginService";
import AgentOperations from "../../services/AgentOperations";
import DataControllerOperations from "../../services/DataControllerOperations";
import pendingIcon from "../../pending.png";
import approvedIcon from "../../approved.png";
import rejectedIcon from "../../rejected.png";
import queuedIcon from "../../queued.png";
import DataControllerCredentialSubjectView from "../dataController/DataControllerCredentialSubjectView";
import DarkenOverlay from "./DarkenOverlay";
import DataAgentLoginModal from "./DataAgentLoginModal";
import AdminOperations from "../../services/AdminOperations";
import AgentTaskAssignModal from "./AgentTaskAssignModal";

class DataControllerLoginModal extends React.Component {
  constructor() {
    super();
    this.usernameRef = React.createRef();
    this.passwordRef = React.createRef();
    this.checkBoxRef = React.createRef();
    this.state = {
      selectedOption: 0,
      isModify: false,
      isDelete: false,
      deleteConfirmed: false,
      editableData: {},
      internalUserData: null,
      notificationCount: 3,
      checkAlerts: false,
      associatedData: null,
      selectedSubject: null,
      showSubjectPopup: false,
      comparisonItem: null,
      isAdminLoginSuccess: false,
      isAgentLoginSuccess: false,
      adminLoggedInSuccessfully: false,
      userData: null,
      defaultView: true,
      viewAssignTaskModal: false,
      assignTasks: false,
    };
  }
  handleLogout = () => {
    this.setState({
      isAdminLoginSuccess: false,
      isAgentLoginSuccess: false,
      adminLoggedInSuccessfully: false,
      userData: null,
      internalUserData: null,
      defaultView: true,
      selectedOption: 0,
      isModify: false,
      isDelete: false,
      deleteConfirmed: false,
      editableData: {},
      associatedData: null,
      selectedSubject: null,
      showSubjectPopup: false,
      comparisonItem: null,
      viewAssignTaskModal: false,
      assignTasks: false,
    });

    if (this.props.onUserLogout) {
      this.props.onUserLogout();
    }
    if (this.props.closePopup) {
      this.props.closePopup();
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const orgAdminChecked = this.checkBoxRef.current.checked;

    const payload = {
      orgUsername: this.usernameRef.current.value,
      orgPassword: this.passwordRef.current.value,
      adminUsername: this.usernameRef.current.value,
      adminPassword: this.passwordRef.current.value,
      notificationCountRetrieval: false,
    };

    const payloadNotify = {
      orgUsername: this.usernameRef.current.value,
      orgPassword: this.passwordRef.current.value,
      adminUsername: this.usernameRef.current.value,
      adminPassword: this.passwordRef.current.value,
      notificationCountRetrieval: true,
    };
    if (orgAdminChecked) {
      LoginService.LoginDataController(payload)
        .then((response) => {
          console.log("Login success 01:", response.data.data);

          LoginService.LoginDataController(payloadNotify)
            .then((response) => {
              this.setState({
                isAdminLoginSuccess: true,
                userData: response.data.data,
              });
            })
            .catch((error) => {
              console.error("Notification Rendering failed:", error);
              alert(
                error.response?.data?.responseMessage ||
                  "Notification Fetching failed. Please try again.",
              );
            });
        })
        .catch((error) => {
          AdminOperations.GetAdminData(payload)
            .then((response) => {
              console.log("Admin Data Fetched :", response?.data);
              this.setState({
                userData: response?.data?.data || {},
                adminLoggedInSuccessfully: true,
                defaultView: false,
              });

              if (this.props.onAdminLogin) {
                this.props.onAdminLogin(response?.data?.data, "ADMIN");
              }
            })
            .catch((error1) => {
              console.error("Admin Data Fetched failed:", error1);
              alert(
                error1.response?.data?.responseMessage ||
                  "Admin Fetching failed. Please try again.",
              );
            });
        });
    } else {
      AgentOperations.LoginAgentDataController(payload)
        .then((response) => {
          console.log("Login Agent success 01:", response.data.data);

          this.setState({
            isAgentLoginSuccess: true,
            userData: response.data.data,
          });
        })
        .catch((error) => {
          console.error("Login Agent failed:", error.response || error);
          alert(
            error.response?.data?.responseMessage ||
              "Login Agent failed. Please try again.",
          );
        });
    }
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
    const { selectedOption, userData } = this.state;

    if (selectedOption === 1) {
      this.setState({ isModify: true, isDelete: false });
    } else if (selectedOption === 2) {
      this.setState({ isModify: false, isDelete: true });
    } else {
      return;
    }

    const editableData = {};

    Object.entries(userData).forEach(([key, value]) => {
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
                internalUserData: updatedControllerData,
              });
            }
          })
          .catch((error) => {
            alert(
              error.response?.data?.responseMessage ||
                "Data Fetching Went Wrong. Please try again.",
            );
          });
      })
      .catch((error) => {
        console.error("Modification failed:", error.response || error);
        alert(
          error.response?.data?.responseMessage ||
            "Modification failed. Please try again.",
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
      dcCode: this.state.userData?.id,
      status: "2",
    };

    DataControllerOperations.deleteDataControllerData(payload)
      .then((response) => {
        alert("Controller Data Deleted Successfully.");
        console.log("Deletion success:", response.data);
        this.setState({
          selectedOption: 0,
          isAdminLoginSuccess: false,
          userData: null,
          isModify: false,
          isDelete: false,
          deleteConfirmed: false,
          editableData: {},
          internalUserData: null,
        });
      })
      .catch((error) => {
        console.error("Deletion failed:", error.response || error);
        alert(
          error.response?.data?.responseMessage ||
            "Deletion failed. Please try again.",
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
      dcCode: this.state.userData?.id,
      isAgentAlert: false,
    };

    DataControllerOperations.requestAssociatedDataSubjectsWithOrganization(
      payload,
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
          error.response || error,
        );
        alert(
          error.response?.data?.responseMessage ||
            "Fetching failed. Please try again.",
        );
      });
  };

  handleTaskAssignment = (event) => {
    event.preventDefault();
    const payload = {
      dcCode: this.state.userData?.id,
      isAgentAlert: false,
      isTaskAssign: true,
    };

    DataControllerOperations.requestAssociatedDataSubjectsWithOrganization(
      payload,
    )
      .then((response) => {
        console.log("Pending Data Fetched :", response?.data);

        this.setState({
          assignTasks: !this.state.assignTasks,
          associatedData: response.data.data,
        });
      })
      .catch((error) => {
        console.error("Pending Data Fetched failed:", error.response || error);
        alert(
          error.response?.data?.responseMessage ||
            "Pending Data Fetchingfailed. Please try again.",
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

  fetchIconForActivityStatus = (item, isAdminLoginSuccess) => {
    if (isAdminLoginSuccess) {
      switch (item.adminActivityStatus?.code) {
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
    } else {
      switch (item.adminActivityStatus?.code) {
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
    }
  };

  fetchClassNameFromActivityStatus = (item, isAdminLoginSuccess) => {
    if (isAdminLoginSuccess) {
      switch (item.adminActivityStatus?.code) {
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
    } else {
      switch (item.adminActivityStatus?.code) {
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

  handleSubjectCardClick = (item, isAdminLoginSuccess) => {
    console.log("Subject card clicked:", item);
    try {
      if (item.activityStatus?.code === "QUEUED") {
        alert("Queued By Agent");
      }
      if (item.activityStatus?.code === "REJC") {
        alert(
          "This request had already been rejected by an Agent. Please click okay to provide your feedback on the rejection / approval.",
        );
      }
      if (item.activityStatus?.code === "APPR") {
        alert(
          "This request had already been approved by an Agent. Please click okay to provide your feedback on the rejection / approval.",
        );
      }
      if (item.activityStatus?.code === "SKIP") {
        alert(
          "This request had already been skipped by an Agent. Please click okay to provide your feedback on the rejection / approval.",
        );
      }
      const flatOld = this.flattenObject(JSON.parse(item.backupData || "{}"));
      const flatNew = this.flattenObject(
        JSON.parse(item.collectedData || "{}"),
      );

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
    } catch (e) {
      console.error("JSON parse error", e);
      alert("Invalid data format");
    }
  };

  render() {
    const adminDataToDisplay =
      this.state.internalUserData || this.state.userData;

    return (
      <>
        {this.state.defaultView && (
          <form
            className={`dashboard-div-popup-container ${
              this.state.isAdminLoginSuccess ? "deactive" : ""
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
            <label>
              <input type="checkbox" ref={this.checkBoxRef} />
              &nbsp; Yes, I am a Data Controller Admin
            </label>
            <input
              className="dashboard-div-popup-container-credentials-form-submit"
              type="submit"
              value="Login"
            />
          </form>
        )}
        {this.state.isAdminLoginSuccess && (
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

                  {100 > adminDataToDisplay?.notifications && (
                    <span className="notification-badge">
                      {adminDataToDisplay?.notifications}
                    </span>
                  )}

                  {adminDataToDisplay?.notifications > 100 && (
                    <span className="notification-badge">100+</span>
                  )}
                </div>
                <div className="data-controller-profile-result-div-middle-2-top-name">
                  Welcome
                  {adminDataToDisplay ? `, ${adminDataToDisplay?.orgName}` : ""}
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
                <button
                  className="data-controller-profile-result-div-middle-2-bottom-btn"
                  onClick={this.handleTaskAssignment}
                >
                  Assign tasks
                </button>
                <button
                  className="data-controller-profile-result-div-middle-2-bottom-btn"
                  onClick={this.handleLogout}
                >
                  Log out
                </button>
              </div>
            </div>
            <div className="data-controller-profile-result-div-middle-3"></div>
            <div className="data-controller-profile-result-div-middle-4">
              <div className="data-controller-profile-result-div-middle-4-top">
                <h1>Organizational Information</h1>
                {adminDataToDisplay &&
                  (() => {
                    const rows = Object.entries(adminDataToDisplay)
                      .filter(
                        ([key]) => typeof adminDataToDisplay[key] !== "object",
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
              {adminDataToDisplay &&
                (() => {
                  const rows = Object.entries(adminDataToDisplay)
                    .filter(
                      ([key]) => typeof adminDataToDisplay[key] !== "object",
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
                                        e.target.value,
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
                  Dear Admin, Are you sure to delete your information from{" "}
                  {adminDataToDisplay?.lastUpdatedTime}? Please note that this
                  approach is not reversible at any costs. Therefore, make sure
                  to proceed at you own risk. And check the below box to accept
                  the risk and continue on data erasing procedure.
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
                <button
                  type="button"
                  className="data-controller-profile-data-subjects-alert-div-top-outer-form-cancel-btn"
                  onClick={() => this.setState({ checkAlerts: false })}
                >
                  cancel
                </button>
              </div>

              <div className="data-controller-profile-data-subjects-alert-div-middle-outer">
                {this.state.associatedData &&
                  this.state.associatedData.map((item) => (
                    <div
                      key={item.id}
                      className={this.fetchClassNameFromActivityStatus(
                        item,
                        this.state.isAdminLoginSuccess,
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        this.handleSubjectCardClick(
                          item,
                          this.state.isAdminLoginSuccess,
                        );
                      }}
                    >
                      <div className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-field-name">
                        {item.dsCode?.firstName} {item.dsCode?.lastName}
                      </div>

                      <div className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-ds-unique">
                        {this.fetchUniqueDataOfCustomer(item)}
                      </div>

                      <div className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-activity-status">
                        {this.fetchIconForActivityStatus(
                          item,
                          this.state.isAdminLoginSuccess,
                        )}
                      </div>

                      <div className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-action">
                        <span className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-action-dropdown">
                          {(() => {
                            switch (item.adminActivityStatus?.code) {
                              case "PEND":
                                return "Pending";
                              case "APPR":
                                return "Approved";
                              case "REJC":
                                return "Rejected";
                              case "QUEU":
                                return "Queued";
                              case "SKIP":
                                return "Skipped";
                            }
                          })()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Assign tasks to agents under the controller  ----> START */}
            <div
              className={`data-controller-profile-data-subjects-alert-div ${
                this.state.assignTasks ? "active" : ""
              }`}
            >
              <div className="data-controller-profile-data-subjects-alert-div-top-outer">
                <button
                  type="button"
                  className="data-controller-profile-data-subjects-alert-div-top-outer-form-cancel-btn"
                  onClick={() => this.setState({ assignTasks: false })}
                >
                  cancel
                </button>
              </div>

              <div className="data-controller-profile-data-subjects-alert-div-middle-outer">
                {this.state.associatedData &&
                  this.state.associatedData.map((item) => (
                    <div
                      key={item.id}
                      className={this.fetchClassNameFromActivityStatus(
                        item,
                        this.state.isAdminLoginSuccess,
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        this.handleSubjectCardClick(
                          item,
                          this.state.isAdminLoginSuccess,
                        );
                      }}
                    >
                      <div className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-field-name">
                        {item.dsCode?.firstName} {item.dsCode?.lastName}
                      </div>

                      <div className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-ds-unique">
                        {this.fetchUniqueDataOfCustomer(item)}
                      </div>

                      <div className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-activity-status">
                        {this.fetchIconForActivityStatus(
                          item,
                          this.state.isAdminLoginSuccess,
                        )}
                      </div>

                      <div className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-action">
                        <button
                          className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-action-dropdown-agt-btn"
                          onClick={() =>
                            this.setState({ viewAssignTaskModal: true })
                          }
                        >
                          Assign task
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            {/* Assign tasks to agents under the controller  ----> STOP */}

            {this.state.showSubjectPopup && this.state.comparisonItem && !this.state.viewAssignTaskModal && (
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

        {this.state.isAgentLoginSuccess && (
          <DataAgentLoginModal
            userData={this.state.userData}
            onUserLogout={this.props.onUserLogout}
          />
        )}

        {this.state.viewAssignTaskModal && (
          <div className="agent-task-assign-modal-overlay" onClick={(e) => e.stopPropagation()}>
            <AgentTaskAssignModal
              data={this.state.selectedSubject}
              onClose={() =>
                this.setState({
                  viewAssignTaskModal: false,
                selectedSubject: null,
                comparisonItem: null,
              })
            }
          />
          </div>
        )}
      </>
    );
  }
}

export default DataControllerLoginModal;

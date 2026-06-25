import React from "react";
import "./UserProfile.scss";
import DataSubjectOperations from "../../services/DataSubjectOperations";
import DarkenOverlay from "../dashboard/DarkenOverlay";
import CheckAlerts from "../checkAlerts/CheckAlerts";
import DataSection from "./DataSection";

class UserProfile extends React.Component {
  constructor() {
    super();
    this.inputRef = React.createRef();
    this.state = {
      selectedOption: 0,
      isModify: false,
      isDelete: false,
      editableData: {},
      deleteConfirmed: false,
      notifications: [],
      userData: [],
      loading: false,
    };
  }
  componentDidMount() {
    this.fetchDataFromDsCode(this.props.customerData);
  }

  componentDidUpdate(prevProps) {
    const prevId = prevProps.customerData;
    const currentId = this.props.customerData;

    if (prevId !== currentId && currentId) {
      this.fetchDataFromDsCode(this.props.customerData);
    }
  }
  formatKeyLabel = (key) => {
    return key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  handleOrgChange = (event) => {
    const selectedOption = Number(event.target.value);

    this.setState({
      selectedOption,
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const selectedOption = this.state.selectedOption;

    if (selectedOption === 1) {
      this.setState({ isModify: true, isDelete: false });
    } else if (selectedOption === 2) {
      this.setState({ isModify: false, isDelete: true });
    }
    let parsedData = {};

    try {
      parsedData = JSON.parse(this.props.customerData.collectedData);
    } catch {
      return;
    }
    const editableData = {};
    Object.entries(parsedData).forEach(([section, values]) => {
      Object.entries(values).forEach(([key, value]) => {
        editableData[`${section}.${key}`] = value;
      });
    });
    this.setState({
      editableData,
    });
  };

  handleModification = (event) => {
    event.preventDefault();

    const updatedData = {
      metadata: {},
      profile: {},
      serviceData: {},
      consents: {},
    };

    const allowedSections = ["metadata", "profile", "serviceData", "consents"];

    Object.entries(this.state.editableData).forEach(([flatKey, value]) => {
      const [section, key] = flatKey.split(".");

      if (!allowedSections.includes(section)) return;

      updatedData[section][key] = value == null ? "" : String(value);
    });

    console.log(updatedData);

    const payload = {
      dsCode: this.props.customerData?.dsCode?.id,
      dcCode: this.props.customerData?.dcCode?.id,
      status: this.props.customerData?.status?.id,
      collectedData: JSON.stringify(updatedData),
    };
    console.log("Payload to backend:", payload);

    DataSubjectOperations.modifyDataSubjectData(payload)
      .then((response) => {
        console.log("Modification success:", response.data);

        DataSubjectOperations.requestDataSubjectData(payload)
          .then((response) => {
            console.log("Fetching success:", response.data);
            const updatedCustomerData = response.data?.data;
            if (updatedCustomerData) {
              this.setState({
                editableData: {},
              });

              this.setState((prevState) => ({
                internalCustomerData: updatedCustomerData,
                notifications: prevState.notifications + 1,
              }));
            }
          })
          .catch((error) => {
            console.error("Data fetching failed:", error.response?.data);
            alert(
              error.response?.data?.responseMessage ||
                "Data Fetching Went Wrong. Please try again.",
            );
          });
      })
      .catch((error) => {
        console.error("Modification failed:", error.response?.data);
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

  handleFieldChange = (key, value) => {
    this.setState((prevState) => ({
      editableData: {
        ...prevState.editableData,
        [key]: value,
      },
    }));
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
      dsCode: this.props.customerData?.dsCode?.id,
      dcCode: this.props.customerData?.dcCode?.id,
      status: "2",
    };

    DataSubjectOperations.deleteDataSubjectData(payload)
      .then((response) => {
        alert("Customer Data Deletion request Sent Successfully.");
        console.log("Deletion request success:", response.data);
        this.setState({
          selectedOption: 0,
          isModify: false,
          isDelete: false,
          editableData: {},
          deleteConfirmed: false,
          notifications: this.state.notifications - 1,
        });
        if (this.props.onDeleteSuccess) {
          this.props.onDeleteSuccess();
        }
      })
      .catch((error) => {
        console.error("Deletion failed:", error.response?.data);
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

  handleOnReportGeneration = (event) => {
    this.setState({ loading: true });
    const payload = {
      dsCode: this.props.customerData?.dsCode?.id,
      dcCode: this.props.customerData?.dcCode?.id,
    };
    setTimeout(() => {
      DataSubjectOperations.generateDataSubjectDataReport(payload)
        .then((response) => {
          const blob = new Blob([response.data], {
            type: "application/pdf",
          });

          const url = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = url;
          link.download = "DSR_Report.pdf";
          document.body.appendChild(link);
          link.click();

          link.remove();
          window.URL.revokeObjectURL(url);
          this.setState({ loading: false });
        })
        .catch((error) => {
          console.error("Report Generation failed:", error.response?.data);
          alert(
            error.response?.data?.responseMessage ||
              "Report Generation failed. Please try again.",
          );
        });
    }, 1000);
  };

  fetchDataFromDsCode = (customerData) => {
    if (!customerData?.dsCode) return;

    const payload = {
      dsCode: customerData?.dsCode?.id,
      dcCode: customerData?.dcCode?.id,
    };

    DataSubjectOperations.requestDataSubjectRelatedDataFromOrganization(payload)
      .then((response) => {
        const notificationList = response?.data?.data || [];

        console.log("Notification fetch success:", notificationList);

        this.setState({
          userData: notificationList,
          notifications: Array.isArray(notificationList)
            ? notificationList.length
            : 0,
        });
      })
      .catch((error) => {
        console.error("Notification fetch failed:", error);
      });
  };

  handleOnAlertClicked = (dsCode, event) => {
    event.preventDefault();
    const payload = {
      dsCode: dsCode,
    };

    DataSubjectOperations.requestDataSubjectRelatedDataFromOrganization(payload)
      .then((response) => {
        console.log("Agent Associated Data Fetched :", response?.data);

        this.setState({
          checkAlerts: !this.state.checkAlerts,
          userData: response?.data?.data,
        });
      })
      .catch((error) => {
        console.error(
          "Agent Associated Data Fetched failed:",
          error.response?.data,
        );
        alert(
          error.response?.data?.responseMessage ||
            "Agent Fetching failed. Please try again.",
        );
      });
  };

  refreshUserData = () => {
    this.fetchDataFromDsCode(this.props.customerData);
  };

  render() {
    const customerDataToDisplay =
      this.state.internalCustomerData || this.props.customerData;

    const countNotifications = this.state.notifications;
    return (
      <>
        <div className="user-profile-result-div-middle">
          <div className="user-profile-result-div-middle-1"></div>
          <div className="user-profile-result-div-middle-2">
            <div className="user-profile-result-div-middle-2-top">
              <div className="user-profile-result-div-middle-2-top-image">
                <span
                  className="notification-bell-user"
                  onClick={(e) => {
                    e.stopPropagation();
                    this.handleOnAlertClicked(
                      customerDataToDisplay?.dsCode?.id,
                      e,
                    );
                  }}
                >
                  🔔
                </span>

                {100 > countNotifications && (
                  <span className="notification-badge-user">
                    {countNotifications}
                  </span>
                )}

                {countNotifications > 100 && (
                  <span className="notification-badge-user">100+</span>
                )}
              </div>
              <div
                className={
                  this.state.isModify
                    ? "user-profile-result-div-middle-2-top-name-reduced-font"
                    : "user-profile-result-div-middle-2-top-name"
                }
              >
                <span>
                  Hello, {customerDataToDisplay?.dsCode?.firstName}{" "}
                  {customerDataToDisplay?.dsCode?.lastName}
                </span>
              </div>
            </div>
            <div
              className={
                this.state.isModify
                  ? "user-profile-result-div-middle-2-middle-reduced-font"
                  : "user-profile-result-div-middle-2-middle"
              }
            >
              <div className="user-profile-result-div-middle-2-middle-center">
                <span>
                  Hi there, please find the illustrated data related for your
                  requested data controller. Also make sure that those data are
                  valid and legit because those credentials can be rejected by
                  your relevant data controller if they feel its unsafe.
                </span>
              </div>
            </div>
            <div className="user-profile-result-div-middle-2-bottom">
              <button
                className="user-profile-result-div-middle-2-bottom-btn"
                onClick={this.handleOnReportGeneration}
              >
                {" "}
                Download PDF
              </button>
              <button
                className="user-profile-result-div-middle-2-bottom-btn"
                onClick={this.props.onUserLogout}
              >
                {" "}
                Logout{" "}
              </button>
            </div>
          </div>
          <div className="user-profile-result-div-middle-3"></div>
          <div className="user-profile-result-div-middle-4">
            <div className="user-profile-result-div-middle-4-top">
              {customerDataToDisplay?.collectedData &&
                (() => {
                  console.log(
                    "Parsed Data for Display 1:",
                    customerDataToDisplay.collectedData,
                  );
                  let parsedData = {};
                  try {
                    parsedData = JSON.parse(
                      customerDataToDisplay.collectedData,
                    );
                  } catch (e) {
                    return <p>Invalid collected data</p>;
                  }

                  const metadataEntries = Object.entries(
                    parsedData.metadata || {},
                  );
                  const profileEntries = Object.entries(
                    parsedData.profile || {},
                  );
                  const serviceEntries = Object.entries(
                    parsedData.serviceData || {},
                  );

                  const sections = [
                    { title: "Metadata", entries: metadataEntries },
                    { title: "Profile", entries: profileEntries },
                    { title: "Service Data", entries: serviceEntries },
                  ];

                  return (
                    <>
                      <h2>Personal Information</h2>

                      <div className="user-profile-result-div-middle-4-top-data-table">

                        {sections.map((section, index) => (
                          <DataSection
                            key={index}
                            title={section.title}
                            entries={section.entries}
                            isModify={this.state.isModify}
                            formatKeyLabel={this.formatKeyLabel}
                            defaultOpen={index === 0}
                          />
                        ))}
                      </div>
                    </>
                  );
                })()}
            </div>
            <div className="user-profile-result-div-middle-4-bottom">
              <form
                className="user-profile-result-div-middle-4-bottom-form"
                onSubmit={this.handleSubmit}
              >
                <select
                  className="user-profile-result-div-middle-4-bottom-dropdown"
                  onChange={this.handleOrgChange}
                >
                  <option value="0">Select An Option</option>
                  <option value="1">Modify Data</option>
                  <option value="2">Delete Data</option>
                </select>
                <input
                  className="user-profile-result-div-middle-4-bottom-btn"
                  type="submit"
                  value="Proceed"
                />
              </form>
            </div>
          </div>
          <div className="user-profile-result-div-middle-5"></div>

          <DarkenOverlay
            isDelete={this.state.isDelete}
            isModify={this.state.isModify}
            checkAlerts={this.state.checkAlerts}
            cssName="user-profile-overlay"
          />
          <div
            className={`user-profile-popup-div ${
              this.state.isModify ? "active" : ""
            }`}
          >
            {customerDataToDisplay?.collectedData &&
              (() => {
                let parsedData = {};
                try {
                  parsedData = JSON.parse(customerDataToDisplay.collectedData);
                } catch (e) {
                  return <p>Invalid collected data</p>;
                }

                // Remove consents and flatten the rest
                const rows = Object.entries(parsedData)
                  .filter(([section]) => section !== "consents") // keep consents separately if you want
                  .flatMap(([section, values]) =>
                    Object.entries(values).map(([key, value]) => ({
                      section,
                      key,
                      value,
                    })),
                  );
                return (
                  <>
                    <div className="user-profile-popup-div-top-outer">
                      <h3>Modify Your Data</h3>
                    </div>
                    <div className="user-profile-popup-div-middle-outer">
                      <table className="user-profile-popup-div-middle-data-table">
                        <tbody>
                          {rows.map(({ section, key, value }, index) => (
                            <tr key={index}>
                              <td className="user-profile-popup-div-middle-data-table-key-cell">
                                {this.formatKeyLabel(key)}
                              </td>
                              <td className="user-profile-popup-div-middle-data-table-colon-cell">
                                :
                              </td>
                              <td className="user-profile-popup-div-middle-data-table-value-cell">
                                <input
                                  className="value-input"
                                  type="text"
                                  value={
                                    this.state.editableData[
                                      `${section}.${key}`
                                    ] || ""
                                  }
                                  onChange={(e) =>
                                    this.handleFieldChange(
                                      `${section}.${key}`,
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
                    <div className="user-profile-popup-div-bottom-outer">
                      <form
                        onSubmit={this.handleModification}
                        className="user-profile-popup-div-bottom-outer-form"
                      >
                        <button
                          type="button"
                          className="user-profile-popup-div-bottom-outer-form-btn"
                          onClick={this.resetModifySection}
                        >
                          Cancel
                        </button>
                        <input
                          type="submit"
                          value="Modify"
                          className="user-profile-popup-div-bottom-outer-form-btn"
                        />
                      </form>
                    </div>
                  </>
                );
              })()}
          </div>

          <div
            className={`user-profile-delete-popup ${
              this.state.isDelete ? "active" : ""
            }`}
          >
            <form
              className="user-profile-delete-popup-active-form"
              onSubmit={this.handleOnSubmitDelete}
            >
              <h1>Confirmation Form</h1>
              <p>
                Dear {customerDataToDisplay?.dsCode?.firstName}, Are you sure to
                delete your information from{" "}
                {customerDataToDisplay?.dcCode?.orgName}? Please note that this
                approach is not reversible at any costs. Therefore, make sure to
                proceed at you own risk. And check the below box to accept the
                risk and continue on data erasing procedure.
              </p>
              <div className="user-profile-delete-popup-active-form-div-checkbox">
                <input
                  className="user-profile-delete-popup-active-form-div-checkbox-1"
                  type="checkbox"
                  checked={this.state.deleteConfirmed}
                  onChange={(e) =>
                    this.setState({ deleteConfirmed: e.target.checked })
                  }
                  required
                />
                <label>I am proceeding to delete my data at my own risk</label>
              </div>
              <div className="user-profile-delete-popup-active-form-div-buttons">
                <button
                  className="user-profile-delete-popup-active-form-div-buttons-btn"
                  type="button"
                  onClick={this.resetModifySection}
                >
                  Abort Deletion
                </button>
                <input
                  className="user-profile-delete-popup-active-form-div-buttons-btn"
                  type="submit"
                  value="Delete"
                />
              </div>
            </form>
          </div>

          <CheckAlerts
            checkAlerts={this.state.checkAlerts}
            userData={this.state.userData}
            setCheckAlerts={(value) => this.setState({ checkAlerts: value })}
            refreshUserData={this.refreshUserData}
          />

          {this.state.loading && (
            <div className="full-page-loader">
              <div className="loader-spinner"></div>
            </div>
          )}
        </div>
      </>
    );
  }
}

export default UserProfile;

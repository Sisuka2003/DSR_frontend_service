import React from "react";
import "./ViewAdminProfile.scss";
import AdminOperations from "../../services/AdminOperations";
import CommonService from "../../services/CommonService";
import DataControllerOperations from "../../services/DataControllerOperations";

class ViewAdminProfile extends React.Component {
  constructor(props) {
    super();
    this.state = {
      selectedOption: 0,
      adminData: null,
      identifierData: [],
      editableData: {},
      selectedOrgId: "",
      activeOrgs: [],
      identificationCode: "",
      orgName: "",
      username: "",
      password: "",
      idKey: "",
    };
  }

  formatKeyLabel = (key) => {
    return key
      .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase → camel Case
      .replace(/_/g, " ") // snake_case → snake case
      .replace(/\./g, " → ") // nested keys (orgStatus.code)
      .replace(/^./, (str) => str.toUpperCase());
  };

  componentDidMount() {
    const payload = {
      adminUsername: "sis",
      adminPassword: "123456",
    };

    AdminOperations.GetAdminData(payload)
      .then((response) => {
        console.log("Associated Data Fetched :", response?.data);
        this.setState({
          adminData: response?.data?.data || {},
        });
      })
      .catch((error) => {
        console.error("Associated Data Fetched failed:", error);
        alert(
          error.response?.data?.responseMessage ||
            "Fetching failed. Please try again.",
        );
      });

    CommonService.getActiveIdentifiers()
      .then((response) => {
        console.log("identity keys Data Fetched :", response?.data);
        this.setState({
          identifierData: response?.data?.data || [],
        });
      })
      .catch((error) => {
        console.error("Identifiers Data Fetched failed:", error);
        alert(
          error.response?.data?.responseMessage ||
            "Identifiers fetching failed. Please try again.",
        );
      });
  }

  updateAdminData = (event) => {
    event.preventDefault();
    console.log("Editable Data to Update:", this.state.editableData);
    const payload = {
      adminId: this.state.adminData?.id,
      adminUsername:
        this.state.editableData.username || this.state.adminData.username,
      adminPassword:
        this.state.editableData.password || this.state.adminData.password,
      adminFname:
        this.state.editableData.firstName || this.state.adminData.firstName,
      adminLname:
        this.state.editableData.lastName || this.state.adminData.lastName,
    };

    AdminOperations.UpdateAdminData(payload)
      .then((response) => {
        console.log("Associated Data Updated :", response?.data);
        this.componentDidMount();
      })
      .catch((error) => {
        console.error("Associated Data Update failed:", error);
        alert(
          error.response?.data?.responseMessage ||
            "Update failed. Please try again.",
        );
      });
  };

  addNewController = (event) => {
    event.preventDefault();

    const payload = {
      orgName: this.state.orgName,
      username: this.state.username,
      password: this.state.password,
      orgEmailAddress: this.state.emailAddress,
      idKey: this.state.idKey,
      agentCount: this.state.agentCount,
    };

    console.log("Payload:", payload);

    DataControllerOperations.addNewDataController(payload)
      .then((response) => {
        console.log("Data Controller Added:", response?.data);

        // reset form
        this.setState({
          orgName: "",
          username: "",
          password: "",
          idKey: "",
          agentCount: 0,
        });

        this.componentDidMount();
      })
      .catch((error) => {
        console.error("Failed to add Data Controller:", error);
        alert(
          error.response?.data?.responseMessage ||
            "Failed to add Data Controller. Please try again.",
        );
      });
  };

  handleControllerInputChange = (e) => {
    const { name, value } = e.target;

    this.setState({
      [name]: value,
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

  render() {
    const adminDataToDisplay = this.state.adminData || {};
    const { mode } = this.props;

    const isViewAdminClicked = mode === "PRFL";
    const isModifyOptionClicked = mode === "MDFY";
    const isControllerAdditionRequired = mode === "CNTR";

    return (
      <div className="admin-view-profile-section">
        <div className="admin-view-profile-section-dev-tools">
          <span
            className="admin-view-profile-section-dev-tools-close-icon"
            onClick={() => this.props.closePopup(null)}
          >
            X
          </span>
        </div>
        <div className="admin-view-profile-section-component-tools">
          {isViewAdminClicked && (
            <>
              <div className="admin-view-profile-section-middle-total">
                <div className="admin-view-profile-section-middle-top">
                  <h1>My Information</h1>
                  <p> Below listed credentials are the information related to you. 
                    Please note that this interface is not used for data modifications or deletions. 
                    Please sue the other options in that case. 
                    This interfaces in solely focused with the data visualization</p>
                  {adminDataToDisplay &&
                    (() => {
                      const rows = Object.entries(adminDataToDisplay)
                        .filter(
                          ([key]) =>
                            typeof adminDataToDisplay[key] !== "object",
                        ) // simple fields
                        .map(([key, value]) => ({ key, value }));

                      return (
                        <>
                          <table className="admin-view-profile-section-middle-top-data-table">
                            <tbody>
                              {rows.map(({ key, value }, index) => (
                                <tr key={index}>
                                  <td className="admin-view-profile-section-middle-top-data-table-key-cell">
                                    {this.formatKeyLabel(key)}
                                  </td>
                                  <td className="admin-view-profile-section-middle-top-data-table-colon-cell">
                                    :
                                  </td>
                                  <td className="admin-view-profile-section-middle-top-data-table-value-cell">
                                    <span className="value-input">
                                      {String(value)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </>
                      );
                    })()}
                </div>
              </div>
            </>
          )}
          {isModifyOptionClicked && (
            <div className="admin-view-profile-section-right">
              <div className="admin-view-profile-section-right-content">
                <div className="admin-view-profile-section-right-content-top">
                  <h2>Update Information</h2>
                  {adminDataToDisplay &&
                    (() => {
                      const rows = Object.entries(adminDataToDisplay)
                        .filter(
                          ([key]) =>
                            typeof adminDataToDisplay[key] !== "object",
                        ) // simple fields
                        .map(([key, value]) => ({ key, value }));

                      return (
                        <>
                          <table className="admin-view-profile-section-middle-top-data-table">
                            <tbody>
                              {rows.map(({ key, value }, index) => (
                                <tr key={index}>
                                  <td className="admin-view-profile-section-middle-top-data-table-key-cell">
                                    {this.formatKeyLabel(key)}
                                  </td>
                                  <td className="admin-view-profile-section-middle-top-data-table-colon-cell">
                                    :
                                  </td>
                                  <td className="admin-view-profile-section-middle-top-data-table-value-cell">
                                    <input
                                      className="value-input"
                                      defaultValue={String(value)}
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
                        </>
                      );
                    })()}
                </div>

                <div className="admin-view-profile-section-right-content-actions">
                  <button onClick={this.updateAdminData}>Modify Data</button>
                  <button>Delete Data</button>
                </div>
              </div>
            </div>
          )}

          {isControllerAdditionRequired && (
            <div className="admin-view-profile-section-right">
              <div className="admin-view-profile-section-right-content">
                <div className={isControllerAdditionRequired ? 'admin-view-profile-section-right-content-top-contr': 'admin-view-profile-section-right-content-top'}>
                  <br/>
                  <h2>Add New Data Controller</h2>
                  <form onSubmit={this.addNewController} className="admin-view-profile-section-right-content-top-form">
                    <input
                      type="text"
                      name="orgName"
                      placeholder="Organization name"
                      className="admin-view-profile-section-right-content-top-form-orgName"
                      required
                      value={this.state.orgName}
                      onChange={this.handleControllerInputChange}
                    />

                    <input
                      type="text"
                      name="username"
                      placeholder="Organization Username"
                      className="admin-view-profile-section-right-content-top-form-org-username"
                      required
                      value={this.state.username}
                      onChange={this.handleControllerInputChange}
                    />

                    <input
                      type="text"
                      name="password"
                      placeholder="Organization Password"
                      className="admin-view-profile-section-right-content-top-form-org-password"
                      required
                      value={this.state.password}
                      onChange={this.handleControllerInputChange}
                    />

                    <input
                      type="email"
                      name="emailAddress"
                      placeholder="Organization Email"
                      className="admin-view-profile-section-right-content-top-form-org-username"
                      required
                      value={this.state.email}
                      onChange={this.handleControllerInputChange}
                    />
                    <input
                      type="number"
                      name="agentCount"
                      placeholder="Organization Agent Count"
                      className="admin-view-profile-section-right-content-top-form-agt-count"
                      required
                      value={this.state.agentCount}
                      onChange={this.handleControllerInputChange}
                    />
                    <select
                      name="idKey"
                      required
                      value={this.state.idKey}
                      className="admin-view-profile-section-right-content-top-form-key-id"
                      onChange={this.handleControllerInputChange}
                    >
                      <option value="">
                        Please Select The Identification Key
                      </option>

                      {this.state.identifierData.map((idkey) => (
                        <option key={idkey.id} value={idkey.id}>
                          {idkey.description}
                        </option>
                      ))}
                    </select>
                    <div className="admin-view-profile-section-right-content-top-form-action">
                      <input type="submit" value="Add Controller" />
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}


          
        </div>
      </div>
    );
  }
}

export default ViewAdminProfile;

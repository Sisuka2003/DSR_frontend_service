import React from "react";
import LoginService from "../../services/LoginService";
import DataControllerOperations from "../../services/DataControllerOperations";

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
        console.log("Login success:", response.data);

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
                <div className="data-controller-profile-result-div-middle-2-top-image"></div>
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
                this.state.isModify || this.state.isDelete ? "active" : ""
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
          </div>
        )}
      </>
    );
  }
}

export default DataControllerLoginModal;

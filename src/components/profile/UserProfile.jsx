import React from "react";
import "./UserProfile.scss";
import DataSubjectOperations from "../../services/DataSubjectOperations";

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
    };
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

              this.setState({ internalCustomerData: updatedCustomerData });
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
        });
        if (this.props.onDeleteSuccess) {
          this.props.onDeleteSuccess();
        }
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

  handleOnReportGeneration = (event) => {
    const payload = {
      dsCode: this.props.customerData?.dsCode?.id,
      dcCode: this.props.customerData?.dcCode?.id,
    };
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
      })
      .catch((error) => {
        console.error("Report Generation failed:", error.response || error);
        alert(
          error.response?.data?.message ||
            "Report Generation failed. Please try again."
        );
      });
  };

  render() {
    const customerDataToDisplay =
      this.state.internalCustomerData || this.props.customerData;
    return (
      <div className="user-profile-result-div-middle">
        <div className="user-profile-result-div-middle-1"></div>
        <div className="user-profile-result-div-middle-2">
          <div className="user-profile-result-div-middle-2-top">
            <div className="user-profile-result-div-middle-2-top-image"></div>
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
          </div>
        </div>
        <div className="user-profile-result-div-middle-3"></div>
        <div className="user-profile-result-div-middle-4">
          <div className="user-profile-result-div-middle-4-top">
            {customerDataToDisplay?.collectedData &&
              (() => {
                let parsedData = {};
                try {
                  parsedData = JSON.parse(customerDataToDisplay.collectedData);
                } catch (e) {
                  return <p>Invalid collected data</p>;
                }
                const rows = Object.entries(parsedData)
                  .filter(([section]) => section !== "consents") // keep consents separately if you want
                  .flatMap(([section, values]) =>
                    Object.entries(values).map(([key, value]) => ({
                      section,
                      key,
                      value,
                    }))
                  );

                return (
                  <>
                    <h1>Personal Information</h1>

                    <table className="user-profile-result-div-middle-4-top-data-table">
                      <tbody>
                        {rows.map(({ section, key, value }, index) => (
                          <tr key={index}>
                            <td
                              className={
                                this.state.isModify
                                  ? "user-profile-result-div-middle-4-top-data-table-key-cell-reduced-font"
                                  : "user-profile-result-div-middle-4-top-data-table-key-cell"
                              }
                            >
                              {this.formatKeyLabel(key)}
                            </td>
                            <td className="user-profile-result-div-middle-4-top-data-table-colon-cell">
                              :
                            </td>
                            <td
                              className={
                                this.state.isModify
                                  ? "user-profile-result-div-middle-4-top-data-table-value-cell-reduced-font"
                                  : "user-profile-result-div-middle-4-top-data-table-value-cell"
                              }
                            >
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
        <div
          className={`user-profile-overlay ${
            this.state.isModify || this.state.isDelete ? "active" : ""
          }`}
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
                  }))
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
      </div>
    );
  }
}

export default UserProfile;

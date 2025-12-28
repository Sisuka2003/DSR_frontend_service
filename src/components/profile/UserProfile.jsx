import React from "react";
import "./UserProfile.scss";

class UserProfile extends React.Component {
  constructor() {
    super();
    this.inputRef = React.createRef();
    this.state = {
      selectedOption: 0,
      isModify: false,
      isDelete: false,
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
  }

  render() {
    const { customerData } = this.props;
    return (
      <div className="user-profile-result-div-middle">
        <div className="user-profile-result-div-middle-1"></div>
        <div className="user-profile-result-div-middle-2">
          <div className="user-profile-result-div-middle-2-top">
            <div className="user-profile-result-div-middle-2-top-image"></div>
            <div className={this.state.isModify ? "user-profile-result-div-middle-2-top-name-reduced-font" : "user-profile-result-div-middle-2-top-name"}>
              <span>
                Hello, {customerData?.dsCode?.firstName}{" "}
                {customerData?.dsCode?.lastName}
              </span>
            </div>
          </div>
          <div className={this.state.isModify ? "user-profile-result-div-middle-2-middle-reduced-font" : "user-profile-result-div-middle-2-middle"}>
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
            <button className="user-profile-result-div-middle-2-bottom-btn">
              {" "}
              Download PDF
            </button>
          </div>
        </div>
        <div className="user-profile-result-div-middle-3"></div>
        <div className="user-profile-result-div-middle-4">
          <div className="user-profile-result-div-middle-4-top">
            {customerData?.collectedData &&
              (() => {
                let parsedData = {};
                try {
                  parsedData = JSON.parse(customerData.collectedData);
                } catch (e) {
                  return <p>Invalid collected data</p>;
                }

                // Remove consents and flatten the rest
                const rows = Object.entries(parsedData)
                  .filter(([section]) => section !== "consents")
                  .flatMap(([_, values]) => Object.entries(values));

                return (
                  <>
                    <h1>Personal Information</h1>

                    <table className="user-profile-result-div-middle-4-top-data-table">
                      <tbody>
                        {rows.map(([key, value], index) => (
                          <tr key={index}>
                            <td className={this.state.isModify ? "user-profile-result-div-middle-4-top-data-table-key-cell-reduced-font" : "user-profile-result-div-middle-4-top-data-table-key-cell"}>
                              {this.formatKeyLabel(key)}
                            </td>
                            <td className="user-profile-result-div-middle-4-top-data-table-colon-cell">
                              :
                            </td>
                            <td className={this.state.isModify ? "user-profile-result-div-middle-4-top-data-table-value-cell-reduced-font" : "user-profile-result-div-middle-4-top-data-table-value-cell"}>
                              <input
                                className="value-input"
                                type="text"
                                value={String(value)}
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
          className={`user-profile-popup-div ${
            this.state.isModify ? "active" : ""
          }`}
        ></div>
      </div>
    );
  }
}

export default UserProfile;

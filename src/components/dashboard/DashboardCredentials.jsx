import React from "react";
import CommonService from "../../services/CommonService";
import LoginService from "../../services/LoginService";

class DashboardCredentials extends React.Component {
  constructor() {
    super();
    this.inputRef = React.createRef();
    this.state = {
      activeOrgs: [],
      selectedOrgId: "",
      identificationCode: "",
      placeHolderText: "Please select an organization first",
    };
  }

  componentDidMount() {
    CommonService.getActiveOrganizationsForDropdown()
      .then((response) => {
        this.setState({ activeOrgs: response.data.data });
      })
      .catch((error) => console.error(error));
  }

  handleOrgChange = (event) => {
    const selectedOrgId = Number(event.target.value);

    const selectedOrg = this.state.activeOrgs.find(
      (org) => org.id === selectedOrgId
    );

    const placeHolderText = selectedOrg?.identificationKey?.description
      ? `Please enter your ${selectedOrg.identificationKey.description}`
      : "Please enter your identification";

    this.setState({
      selectedOrgId,
      identificationCode: selectedOrg.identificationKey.code,
      placeHolderText,
    });
  };

  handleSubmit = (event) => {
    event.preventDefault();

    const { selectedOrgId, identificationCode } = this.state;
    const userInput = this.inputRef.current.value;

    const payload = {
      emailAddress: null,
      mobileNumber: null,
      nicNumber: null,
      customerID: null,
      organizationID: String(selectedOrgId),
    };

    if (identificationCode === "NIC") {
      payload.nicNumber = userInput;
    } else if (identificationCode === "MOB") {
      payload.mobileNumber = userInput;
    } else if (identificationCode === "EMAIL") {
      payload.emailAddress = userInput;
    } else if (identificationCode === "CUSTID") {
      payload.customerID = userInput;
    }

    LoginService.LoginDataSubject(payload)
      .then((response) => {
        console.log("Login success:", response.data.data);

        if (this.props.onLoginSuccess) {
          this.props.onLoginSuccess(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Login failed:", error.response || error);
        alert(
          error.response?.data?.message || "Login failed. Please try again."
        );
      });
  };

  render() {
    return (
      <div className="dashboard-div-bottom">
        <form
          className="dashboard-div-bottom-credentials-form"
          onSubmit={this.handleSubmit}
        >
          <select
            className="dashboard-div-bottom-credentials-form-select"
            onChange={this.handleOrgChange}
            required
          >
            <option>Please Select Your Organization</option>
            {this.state.activeOrgs.map((org) => (
              <option key={org.identificationKey.code} value={org.id}>
                {org.orgName}
              </option>
            ))}
          </select>
          <input
            ref={this.inputRef}
            className="dashboard-div-bottom-credentials-form-input"
            type="text"
            placeholder={this.state.placeHolderText}
            required
          />
          <input
            className="dashboard-div-bottom-credentials-form-submit"
            type="submit"
            value="Login"
          />
        </form>
      </div>
    );
  }
}

export default DashboardCredentials;

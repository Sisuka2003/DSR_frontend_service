import React from "react";
import CommonService from "../../services/CommonService";
import LoginService from "../../services/LoginService";
import DarkenOverlay from "./DarkenOverlay";
class DashboardCredentials extends React.Component {
  constructor() {
    super();
    this.inputRef = React.createRef();
    this.state = {
      activeOrgs: [],
      selectedOrgId: "",
      identificationCode: "",
      placeHolderText: "Please select an organization first",
      otpInput: "",
      otpVerficationStage: false,
      loginSubjectData: null,
      otpSendState: false,
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

        this.setState({
          loginSubjectData: response?.data?.data,
        });
        const otpCodeRequestPayload = {
          recipientEmail: response.data?.data?.dsCode?.emailAddress,
          dsCode: response.data?.data?.dsCode?.id,
        };

        CommonService.otpCodeRequest(otpCodeRequestPayload)
          .then((response) => {
            console.log(
              "OTP Generation Request Payload success:",
              response.data.data
            );
            this.setState({
              otpVerficationStage: true,
            });
          })
          .catch((error) => {
            console.error("OTP Generation failed:", error.response || error);
            alert(
              error.response?.data?.responseMessage ||
                "OTP Generation failed. Please try again."
            );
          });
      })
      .catch((error) => {
        console.error("Login failed:", error.response || error);
        alert(
          error.response?.data?.responseMessage || "Login failed. Please try again."
        );
      });
  };

  handleOtpVerification = (event) => {
    event.preventDefault();
    const payload = {
      otpCode: this.state.otpInput,
      dsCode: this.state.loginSubjectData?.dsCode?.id,
    };

    CommonService.otpCodeVerification(payload)
      .then((response) => {
        console.log(
          "OTP Verification Request Payload success:",
          response.data.data
        );
        this.setState({
          otpVerficationStage: false,
        });

        if (this.props.onLoginSuccess) {
          this.props.onLoginSuccess(this.state.loginSubjectData);
        }
      })
      .catch((error) => {
        console.error("OTP Verification failed:", error.response || error);
        alert(
          error.response?.data?.responseMessage ||
            "OTP Verification failed. Please try again."
        );
      });
  };

  render() {
    return (
      <>
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

        {this.state.otpVerficationStage && (
          <div
            className="dashboard-div-popup-overlay"
            onClick={this.closePopup}
          >
            <div className="dashboard-div-otp-verification-popup">
              <div className="dashboard-div-otp-verification-popup-top">
                <h1>OTP Verification</h1>
              </div>
              <div className="dashboard-div-otp-verification-popup-middle">
                <p className="dashboard-div-otp-verification-popup-middle-otp-paragraph">
                  Dear Customer, Please enter the OTP (One-Time Password) which
                  had been shared with your registered email address in the
                  below to complete you verification procedure.
                </p>
                <br />
                <span className="dashboard-div-otp-verification-popup-middle-otp-title">
                  DSR-&nbsp;
                  <input
                    className="dashboard-div-otp-verification-popup-middle-otp-field"
                    type="text"
                    placeholder="Enter Your OTP Code Here"
                    onChange={(e) =>
                      this.setState({ otpInput: e.target.value })
                    }
                  />
                </span>
              </div>
              <div className="dashboard-div-otp-verification-popup-bottom">
                <button
                  type="button"
                  className="dashboard-div-otp-verification-popup-bottom-btn"
                  onClick={this.handleOtpVerification}
                >
                  Verify
                </button>
                <button
                  type="button"
                  className="dashboard-div-otp-verification-popup-bottom-btn"
                  onClick={() => this.setState({otpVerficationStage : false})}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}

export default DashboardCredentials;

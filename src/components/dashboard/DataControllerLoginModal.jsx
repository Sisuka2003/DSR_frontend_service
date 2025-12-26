import React from "react";
import LoginService from "../../services/LoginService";

class DataControllerLoginModal extends React.Component {
  constructor() {
    super();
    this.usernameRef = React.createRef();
    this.passwordRef = React.createRef();
    this.state = {};
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
      <form
        className="dashboard-div-popup-container"
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
    );
  }
}

export default DataControllerLoginModal;

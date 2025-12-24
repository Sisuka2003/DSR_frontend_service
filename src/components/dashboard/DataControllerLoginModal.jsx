import React from "react";

class DataControllerLoginModal extends React.Component {
  render() {
    const { closePopup } = this.props;
    return (
      <form
        className="dashboard-section-popup-container"
        onClick={(e) => e.stopPropagation()}
      >
        <h1>Sign In</h1>
        <input
            className="dashboard-section-popup-container-form-input-username"
            type="text"
            placeholder="Please Enter Your Username"
            required
          />
        <input
            className="dashboard-section-popup-container-form-input-password"
            type="password"
            placeholder="Please Enter Your Password"
            required
          />
          <input
          onClick={closePopup}
            className="dashboard-section-popup-container-credentials-form-submit"
            type="submit"
            value="Login"
          />
      </form>
    );
  }
}

export default DataControllerLoginModal;

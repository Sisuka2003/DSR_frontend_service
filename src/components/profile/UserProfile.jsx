import React from "react";
import "./UserProfile.scss";

class UserProfile extends React.Component {
  render() {
    const { firstName, lastName } = this.props;
    return (
      <div className="user-profile-result-div-middle">
        <div className="user-profile-result-div-middle-1"></div>
        <div className="user-profile-result-div-middle-2">
          <div className="user-profile-result-div-middle-2-top">
            <div className="user-profile-result-div-middle-2-top-image"></div>
            <div className="user-profile-result-div-middle-2-top-name">
                <span>Hello, {firstName} {lastName}</span>
            </div>
          </div>
          <div className="user-profile-result-div-middle-2-middle">
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
        <div className="user-profile-result-div-middle-4"></div>
        <div className="user-profile-result-div-middle-5"></div>
      </div>
    );
  }
}

export default UserProfile;

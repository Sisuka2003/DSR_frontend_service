import React from "react";
import "./Greetings.scss";

class Greetings extends React.Component {
  renderCurrentDate = (event) => {
    const today = new Date();

    return today.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };
  render() {
    const { adminInformation } = this.props;

    const firstName = adminInformation?.firstName
      ? adminInformation.firstName.charAt(0).toUpperCase() +
        adminInformation.firstName.slice(1)
      : "";
    return (
      <div className="admin-dashboard-section-2-good-morning">
        <div className="admin-dashboard-section-2-good-morning-details">
          <div className="admin-dashboard-section-2-good-morning-date">
            <div className="admin-dashboard-section-2-good-morning-date-div">
              <div className="admin-dashboard-section-2-good-morning-date-div-calendar-icon" />
              <div className="admin-dashboard-section-2-good-morning-date-div-date">
                <span>{this.renderCurrentDate()}</span>
              </div>
            </div>
          </div>
          <div className="admin-dashboard-section-2-good-morning-title">
            <div className="admin-dashboard-section-2-good-morning-title-cover">
              <span style={{ fontSize: "25px", fontStyle: "bold" }}>
                Good Day, {firstName}
              </span>
              <span style={{ fontSize: "15px" }}>&nbsp;Have a Nice Day!!!</span>
            </div>
          </div>
        </div>
        <div className="admin-dashboard-section-2-good-morning-image"></div>
      </div>
    );
  }
}

export default Greetings;

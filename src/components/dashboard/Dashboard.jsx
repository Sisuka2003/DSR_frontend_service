import React from "react";
import "./Dashboard.scss";
import logo from "../../blob.png";
import DashboardCredentials from "./DashboardCredentials";
import Header from "../header/Header";
import DataControllerLoginModal from "./DataControllerLoginModal";

class Dashboard extends React.Component {
  state = {
    showModal: false,
  };

  openPopup = () => {
    this.setState({ showModal: true });
  };

  closePopup = () => {
    this.setState({ showModal: false });
  };

  render() {
    return (
      <section className="dashboard-outer-section">
        <Header openPopup={this.openPopup}/>
        <div className="dashboard-section-middle">
          <div className="dashboard-section-middle-quote">
            <p className="dashboard-section-middle-quote-title">
              DSR Portal for Customer Usability
            </p>
            <p className="dashboard-section-middle-quote-description">
              The DSR portal enables customers to seamlessly connect to their
              respective data sources and conveniently submit requests to access
              their personal information. It provides a centralized,
              user-friendly interface that simplifies the process of
              identifying, retrieving, and managing personal data, ensuring
              transparency, efficiency, and compliance with data protection
              regulations.
            </p>
          </div>
          <div className="dashboard-section-middle-illustration"></div>
        </div>
        <DashboardCredentials />
        {this.state.showModal && (
          <div className="dashboard-section-popup-overlay" onClick={this.closePopup}>
            <DataControllerLoginModal closePopup={this.closePopup}/>
          </div>
        )}
      </section>
    );
  }
}

export default Dashboard;

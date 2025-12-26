import React from "react";
import "./Dashboard.scss";
import logo from "../../blob.png";
import DashboardCredentials from "./DashboardCredentials";
import Header from "../header/Header";
import DataControllerLoginModal from "./DataControllerLoginModal";
import UserProfile from "../profile/UserProfile";

class Dashboard extends React.Component {
  state = {
    showModal: false,
    showResultSection: false,
    customerData: null,
  };

  openPopup = () => {
    this.setState({ showModal: true });
  };

  closePopup = () => {
    this.setState({ showModal: false });
  };
  handleLoginSuccess = (data) => {
    this.setState({ showResultSection: true, customerData: data });
  };
  render() {
    return (
      <section className="dashboard-outer-section">
        <div
          className={`dashboard-outer-div ${
            this.state.showResultSection ? "deactive" : ""
          }`}
        >
          <Header openPopup={this.openPopup} />
          <div className="dashboard-div-middle">
            <div className="dashboard-div-middle-quote">
              <p className="dashboard-div-middle-quote-title">
                DSR Portal for Customer Usability
              </p>
              <p className="dashboard-div-middle-quote-description">
                The DSR portal enables customers to seamlessly connect to their
                respective data sources and conveniently submit requests to
                access their personal information. It provides a centralized,
                user-friendly interface that simplifies the process of
                identifying, retrieving, and managing personal data, ensuring
                transparency, efficiency, and compliance with data protection
                regulations.
              </p>
            </div>
            <div className="dashboard-div-middle-illustration"></div>
          </div>
          <DashboardCredentials onLoginSuccess={this.handleLoginSuccess} />

          {this.state.showModal && (
            <div
              className="dashboard-div-popup-overlay"
              onClick={this.closePopup}
            >
              <DataControllerLoginModal closePopup={this.closePopup} />
            </div>
          )}
        </div>

        <div
          className={`dashboard-result-div ${
            this.state.showResultSection ? "active" : ""
          }`}
        >
          <Header />
          <UserProfile firstName={this.state.customerData?.dsCode?.firstName} lastName={this.state.customerData?.dsCode?.lastName} />
          {/* <div className="dashboard-result-div-middle">
            <div className="dashboard-result-div-middle-1"></div>
            <div className="dashboard-result-div-middle-2">
              
            </div>
            <div className="dashboard-result-div-middle-3"></div>
            <div className="dashboard-result-div-middle-4"></div>
            <div className="dashboard-result-div-middle-5"></div>
            {/* <h1>
              {" "}
              Hello, {this.state.customerData?.dsCode?.firstName}{" "}
              {this.state.customerData?.dsCode?.lastName}!!
            </h1>
            <p> Please find your latest attached personal data with regards to {this.state.customerData?.dcCode?.orgName} of Sri Lanka upto the date of {this.state.customerData?.dcCode?.lastUpdatedTime}</p> </div>*/}
        </div>
      </section>
    );
  }
}

export default Dashboard;

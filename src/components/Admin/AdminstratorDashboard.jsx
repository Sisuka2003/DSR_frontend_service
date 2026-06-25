import React from "react";
import "./AdministratorDashboard.scss";
import Counts from "./Counts";
import Greetings from "./Greetings";
import AnalyticsChart from "./AnalyticsChart";
import ActionBar from "./ActionBar";
import AdminOperations from "../../services/AdminOperations";

class AdministratorDashboard extends React.Component {
  state = {
    showModal: false,
    showResultSection: false,
    customerData: null,
    agentCount: 0,
    controllerCount: 0,
    subjectCount: 0,
    totalRecordCount: 0,
    pendingRecords: 0,
    rejectedRecords: 0,
    expiredRecords: 0,
    queuedRecords: 0,
    ApprovedRecords: 0,
    totalAdminCount: 0,
    adminData: {},
  };

  componentDidMount() {
    const payload = {
      isAdminDashboard: true,
      adminUsername: this.props.adminUsername,
      adminPassword: this.props.adminPassword,
      controllerId: null,
    };

    AdminOperations.GetAdminData(payload)
      .then((response) => {
        console.log("Associated Data Fetched :", response?.data);
        this.setState({
          adminData: response?.data?.data || {},
        });
      })
      .catch((error) => {
        console.error("Associated Data Fetched failed:", error);
        alert(
          error.response?.data?.responseMessage ||
            "Fetching failed. Please try again.",
        );
      });

    AdminOperations.getAdminDashboardData(payload)
      .then((response) => {
        console.log("admin dashboard data fetched :", response?.data);
        this.setState({
          controllerCount: response?.data?.data.dataControllerCount ?? 0,
          subjectCount: response?.data?.data.dataSubjectCount ?? 0,
          totalRecordCount: response?.data?.data.totalDataRecordsCount ?? 0,
          totalAdminCount: response?.data?.data.totalAdminCount ?? 0,
          pendingRecords: response?.data?.data.pendingRecordsCount ?? 0,
          queuedRecords: response?.data?.data.queuedRecordsCount ?? 0,
          ApprovedRecords: response?.data?.data.approvedRecordsCount ?? 0,
          rejectedRecords: response?.data?.data.rejectedRecordsCount ?? 0,
          expiredRecords: response?.data?.data.expiredRecordsCount ?? 0,
        });
      })
      .catch((error) => {
        console.error("Associated Data Fetched failed:", error);
        alert(
          error.response?.data?.responseMessage ||
            "Fetching failed. Please try again.",
        );
      });
  }

  render() {


    return (
      <section className="admindashboard-outer-section">
        {/* vertical action bar */}
        <ActionBar handleLogout={this.props.onAdminLogout}/>

        {/* middle content*/}
        <div className="admin-dashboard-section-2">
          <Greetings adminInformation={this.state.adminData}/>
          <Counts
            isControllerDashboard = {false}
            controllerCount={this.state.controllerCount}
            dataSubjectCount={this.state.subjectCount}
            allRecordCount={this.state.totalRecordCount}
            allAdminsCount={this.state.totalAdminCount}
          />
          <AnalyticsChart
            pendingRecords={this.state.pendingRecords}
            queuedRecords={this.state.queuedRecords}
            approvedRecords={this.state.ApprovedRecords}
            rejectedRecords={this.state.rejectedRecords}
            expiredRecords={this.state.expiredRecords}
          />
        </div>
      </section>
    );
  }
}

export default AdministratorDashboard;

import React from "react";
import "./DataControllerDashboard.scss";
import Counts from "../Admin/Counts";
import Greetings from "../Admin/Greetings";
import AnalyticsChart from "../Admin/AnalyticsChart";
import ActionBar from "../Admin/ActionBar";
import DataControllerOperations from "../../services/DataControllerOperations";
import AdminOperations from "../../services/AdminOperations";

class DataControllerDashboard extends React.Component {
  state = {
    showModal: false,
    showResultSection: false,
    customerData: null,
    agentCount: 0,
    controllerCount: 0,
    totalAgentCount: 0,
    totalRecordCount: 0,
    pendingRecords: 0,
    rejectedRecords: 0,
    queuedRecords: 0,
    ApprovedRecords: 0,
  };

  dataFetch = () => {
    const payload = {
      isAdminDashboard: false,
      controllerId:'1',
    };

    AdminOperations.getAdminDashboardData(payload)
      .then((response) => {
        console.log("controller dashboard data fetched :", response?.data);
        this.setState({
          totalAgentCount: response?.data?.data.totalAgentCount ?? 0,
          totalRecordCount: response?.data?.data.totalDataRecordsCount ?? 0,
          pendingRecords: response?.data?.data.pendingRecordsCount ?? 0,
          queuedRecords: response?.data?.data.queuedRecordsCount ?? 0,
          ApprovedRecords: response?.data?.data.approvedRecordsCount ?? 0,
          rejectedRecords: response?.data?.data.rejectedRecordsCount ?? 0,
        });
      })
      .catch((error) => {
        console.error("controller dashboard data Fetched failed:", error);
        alert(
          error.response?.data?.responseMessage ||
            "controller dashboard data failed. Please try again.",
        );
      });
  }

  render() {

    const {userData, controllerId} =this.props;
    return (
      <section className="admindashboard-outer-section">
        {/* vertical action bar */}
        <ActionBar userData={userData} dataControllerLoggedIn/>

        {/* middle content*/}
        <div className="admin-dashboard-section-2">
          <Greetings adminInformation={this.state.adminData}/>
          <Counts
            isControllerDashboard = {true}
            allRecordCount={this.state.totalRecordCount}
            totalAgentCount={this.state.totalAgentCount}
          />
          <AnalyticsChart
            pendingRecords={this.state.pendingRecords}
            queuedRecords={this.state.queuedRecords}
            approvedRecords={this.state.ApprovedRecords}
            rejectedRecords={this.state.rejectedRecords}
          />
        </div>

        <div className="admin-dashboard-section-3"></div>
      </section>
    );
  }
}

export default DataControllerDashboard;

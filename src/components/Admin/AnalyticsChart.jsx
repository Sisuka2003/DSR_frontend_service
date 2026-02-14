import React from "react";
import "./AnalyticsChart.scss";

class AnalyticsChart extends React.Component {
  render() {
    const {
      pendingRecords,
      queuedRecords,
      approvedRecords,
      rejectedRecords,
    } = this.props;

    const total =
      pendingRecords +
      queuedRecords +
      approvedRecords +
      rejectedRecords || 1;

    const pendingPercent = Math.round((pendingRecords / total) * 100);
    const approvedPercent = Math.round((approvedRecords / total) * 100);
    const rejectedPercent = Math.round((rejectedRecords / total) * 100);
    const queuedPercent = Math.round((queuedRecords / total) * 100);

    return (
      <div className="admin-dashboard-section-2-analytics-chart">
        <div className="admin-dashboard-section-2-analytics-chart-indicators">
          <span>Pending Requests</span>
          <span>Approved Requests</span>
          <span>Rejected Requests</span>
          <span>Queued Requests</span>
        </div>

        <div className="admin-dashboard-section-2-analytics-chart-illustration">
          <div
            className="admin-dashboard-section-2-analytics-chart-illustration-bar-pend"
            style={{ width: `${pendingPercent}%` }}
          />

          <div
            className="admin-dashboard-section-2-analytics-chart-illustration-bar-approved"
            style={{ width: `${approvedPercent}%` }}
          />

          <div
            className="admin-dashboard-section-2-analytics-chart-illustration-bar-rejected"
            style={{ width: `${rejectedPercent}%` }}
          />

          <div
            className="admin-dashboard-section-2-analytics-chart-illustration-bar-queued"
            style={{ width: `${queuedPercent}%` }}
          />
        </div>
      </div>
    );
  }
}

export default AnalyticsChart;
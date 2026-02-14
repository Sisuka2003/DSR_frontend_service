import React from "react";
import "./Counts.scss";

class Counts extends React.Component {
  render() {
    const {
      controllerCount,
      dataSubjectCount,
      allRecordCount,
      allAdminsCount,
    } = this.props;

    return (
      <div className="admin-dashboard-section-2-counts">
        <div className="admin-dashboard-section-2-2-1">
          <div className="admin-dashboard-section-2-2-1-top">Data Subjects</div>
          <div className="admin-dashboard-section-2-2-1-bottom">{dataSubjectCount}</div>
        </div>
        <div className="admin-dashboard-section-2-2-2">
          <div className="admin-dashboard-section-2-2-1-top">
            Data Controllers
          </div>
          <div className="admin-dashboard-section-2-2-1-bottom">{controllerCount}</div>
        </div>
        <div className="admin-dashboard-section-2-2-3">
          <div className="admin-dashboard-section-2-2-1-top">Admins</div>
          <div className="admin-dashboard-section-2-2-1-bottom">{allAdminsCount}</div>
        </div>
        <div className="admin-dashboard-section-2-2-4">
          <div className="admin-dashboard-section-2-2-1-top">Total Records</div>
          <div className="admin-dashboard-section-2-2-1-bottom">{allRecordCount > 100 ? '100+' : allRecordCount}</div>
        </div>
      </div>
    );
  }
}

export default Counts;

import React from "react";
import "./CheckAlerts.scss";
import pendingIcon from "../../pending.png";
import approvedIcon from "../../approved.png";
import rejectedIcon from "../../rejected.png";
import queuedIcon from "../../queued.png";
import DataControllerCredentialSubjectView from "../dataController/DataControllerCredentialSubjectView.jsx";

class CheckAlerts extends React.Component {
  constructor() {
    super();
    this.inputRef = React.createRef();
    this.state = {
      comparisonItem: [],
      checkAlerts: false,
      selectedSubject: null,
      showSubjectPopup: false,
    };
  }

  fetchUniqueDataOfCustomer = (item) => {
    switch (item.dcCode?.identificationKey?.code) {
      case "NIC":
        return item.dsCode?.nicNumber;

      case "MOB":
        return item.dsCode?.mobileNumber;

      case "EMAIL":
        return item.dsCode?.emailAddress;

      case "CUSTID":
        return item.dsCode?.customerId;

      default:
        return null;
    }
  };

  fetchIconForActivityStatus = (item) => {
    if (
      item.activityStatus?.code === "APPR" ||
      item.activityStatus?.code === "REJC" ||
      item.adminActivityStatus?.code === "APPR" ||
      item.adminActivityStatus?.code === "REJC"
    ) {
      switch (item.adminActivityStatus?.code) {
        case "APPR":
          return (
            <img
              className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-action-fetchIconForActivity"
              src={approvedIcon}
              alt="Approved"
            />
          );

        case "REJC":
          return (
            <img
              className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-action-fetchIconForActivity"
              src={rejectedIcon}
              alt="Rejected"
            />
          );

        default:
          return null;
      }
    } else {
      switch (item.subjectActivityStatus?.code) {
        case "PEND":
          return (
            <img
              className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-action-fetchIconForActivity"
              src={pendingIcon}
              alt="Pending"
            />
          );

        case "APPR":
          return (
            <img
              className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-action-fetchIconForActivity"
              src={approvedIcon}
              alt="Approved"
            />
          );

        case "REJC":
          return (
            <img
              className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-action-fetchIconForActivity"
              src={rejectedIcon}
              alt="Rejected"
            />
          );

        case "QUEU":
          return (
            <img
              className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-action-fetchIconForActivity"
              src={queuedIcon}
              alt="Queued"
            />
          );

        case "SKIP":
          return (
            <img
              className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-action-fetchIconForActivity"
              src={queuedIcon}
              alt="Skipped"
            />
          );
        default:
          return null;
      }
    }
  };

  fetchClassNameFromActivityStatus = (item) => {
    if (
      item.activityStatus?.code === "APPR" ||
      item.activityStatus?.code === "REJC" ||
      item.adminActivityStatus?.code === "APPR" ||
      item.adminActivityStatus?.code === "REJC"
    ) {
    
      switch (item.adminActivityStatus?.code) {
        case "APPR":
          return "data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-approved";

        case "REJC":
          return "data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-rejected";

        default:
          return null;
      }
    } else {
      switch (item.subjectActivityStatus?.code) {
        case "PEND":
          return "data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-pending";

        case "APPR":
          return "data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-approved";

        case "REJC":
          return "data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-rejected";

        case "QUEU":
          return "data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-queued";

        case "SKIP":
          return "data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-skipped";
        default:
          return null;
      }
    }
  };

  flattenObject = (obj, parentKey = "", result = {}) => {
    Object.entries(obj).forEach(([key, value]) => {
      const newKey = parentKey ? `${parentKey}.${key}` : key;

      if (typeof value === "object" && value !== null) {
        this.flattenObject(value, newKey, result);
      } else {
        result[newKey] = value;
      }
    });

    return result;
  };

  handleSubjectCardClick = (item) => {
    console.log("Subject card clicked:", item);

    if (
      item.adminActivityStatus?.code === "APPR" ||
      item.activityStatus?.code === "APPR"
    ) {
      return alert("Already Approved By Controller");
    }
    if (
      item.adminActivityStatus?.code === "REJC" ||
      item.activityStatus?.code === "REJC" ||
      item.subjectActivityStatus?.code === "REJC"
    ) {
      return alert("Already Rejected By Controller");
    }
    const flatOld = this.flattenObject(JSON.parse(item.backupData || "{}"));
    const flatNew = this.flattenObject(JSON.parse(item.collectedData || "{}"));

    const allKeys = Array.from(
      new Set([...Object.keys(flatOld), ...Object.keys(flatNew)]),
    );

    const comparisonRows = allKeys.map((key) => {
      const oldValue = flatOld[key] ?? "";
      const newValue = flatNew[key] ?? "";
      const isChanged = String(oldValue) !== String(newValue);

      return {
        key,
        oldValue,
        newValue,
        isChanged,
      };
    });

    this.setState({
      comparisonItem: comparisonRows,
      checkAlerts: false,
      selectedSubject: item,
      showSubjectPopup: true,
    });
  };

  render() {
    const { checkAlerts, userData } = this.props;
    return (
      <>
        <div
          className={`data-controller-profile-data-subjects-alert-div ${
            checkAlerts ? "active" : ""
          }`}
        >
          <div className="data-controller-profile-data-subjects-alert-div-top-outer">
            <form className="data-controller-profile-data-subjects-alert-div-top-outer-form">
              <input
                type="text"
                placeholder="Search data subject by name"
                className="data-controller-profile-data-subjects-alert-div-top-outer-form-search-field"
              />
              <input
                type="submit"
                value="Search"
                className="data-controller-profile-data-subjects-alert-div-top-outer-form-search-btn"
              />

              <button
                type="button"
                className="data-controller-profile-data-subjects-alert-div-top-outer-form-cancel-btn"
                onClick={() => this.props.setCheckAlerts(false)}
              >
                cancel
              </button>
            </form>
          </div>

          <div className="data-controller-profile-data-subjects-alert-div-middle-outer">
            {userData &&
              userData.map((item) => (
                <div
                  key={item.id}
                  className={this.fetchClassNameFromActivityStatus(item)}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.handleSubjectCardClick(item);
                  }}
                >
                  <div className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-field-name">
                    {item.dsCode?.firstName} {item.dsCode?.lastName}
                  </div>

                  <div className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-ds-unique">
                    {this.fetchUniqueDataOfCustomer(item)}
                  </div>

                  <div className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-activity-status">
                    {this.fetchIconForActivityStatus(item)}
                  </div>

                  <div className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-action">
                    <select
                      defaultValue={item.subjectActivityStatus?.code}
                      className="data-controller-profile-data-subjects-alert-div-middle-outer-alert-card-action-dropdown"
                    >
                      <option value="PEND">Pending</option>
                      <option value="APPR">Approved</option>
                      <option value="REJC">Rejected</option>
                      <option value="QUEU">Queued</option>
                      <option value="SKIP">Skipped</option>
                    </select>
                  </div>
                </div>
              ))}
          </div>
        </div>
        {this.state.showSubjectPopup && this.state.comparisonItem && (
          <DataControllerCredentialSubjectView
            comparisonItem={this.state.comparisonItem}
            selectedSubject={this.state.selectedSubject}
            data={this.state.selectedSubject}
            isUserProfile={true}
            onClose={() => {
              this.setState({
                showSubjectPopup: false,
                selectedSubject: null,
                comparisonItem: null,
              });
              if (this.props.refreshUserData) {
                this.props.refreshUserData();
              }
            }}
          />
        )}
      </>
    );
  }
}

export default CheckAlerts;

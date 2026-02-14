import React from "react";
import "./DataControllerCredentialSubjectView.scss";
import rejectDataSubjectDataModificationRequest from "../../services/DataControllerOperations";
import modifyDataSubjectData from "../../services/DataSubjectOperations";
import AdminOperations from "../../services/AgentOperations";

class DataControllerCredentialSubjectView extends React.Component {
  constructor() {
    super();
    this.usernameRef = React.createRef();
    this.passwordRef = React.createRef();
  }

  formatKeyLabel = (key) => {
    const lastKey = key.split(".").pop();

    return lastKey
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .replace(/^./, (str) => str.toUpperCase());
  };

  rejectDataSubjectRequest = (event) => {
    event.preventDefault();

    let payload;
    if (this.props.isUserProfile) {

       payload = {
        dsCode: this.props.selectedSubject?.dsCode?.id,
        dcCode: this.props.selectedSubject?.dcCode?.id,
        status: this.props.selectedSubject?.status?.id,
        isUserProfile: true,
      };
    }else{
      payload = {
        dsCode: this.props.selectedSubject?.dsCode?.id,
        dcCode: this.props.selectedSubject?.dcCode?.id,
        status: this.props.selectedSubject?.status?.id,
      };
    }

    rejectDataSubjectDataModificationRequest
      .rejectDataSubjectDataModificationRequest(payload)
      .then((response) => {
        console.log("Rejection success:", response.data);
        this.props.onClose();
      })
      .catch((error) => {
        alert(
          error.response?.data?.responseMessage ||
            "Rejection Went Wrong. Please try again."
        );
      });
    


  };

  acceptDataSubjectRequest = (event) => {
    event.preventDefault();
    const payload = {
      collectedData: this.props.selectedSubject?.collectedData,
      recordId: this.props.selectedSubject?.id,
      isAnAdmin: true,
      status: this.props.selectedSubject?.status?.id,
    };

    modifyDataSubjectData
      .modifyDataSubjectData(payload)
      .then((response) => {
        console.log("Modification success:", response.data);
        this.props.onClose();
      })
      .catch((error) => {
        alert(
          error.response?.data?.responseMessage ||
            "Modification Went Wrong. Please try again."
        );
      });
  };

  render() {
    const { comparisonItem, isUserProfile } = this.props;
    if (!Array.isArray(comparisonItem)) return null;
    return (
      <div className="data-controller-credential-subject-view-outer">
        <div className="data-controller-credential-subject-view-outer-popup">
          <div className="data-controller-credential-subject-view-outer-popup-header">
            <button onClick={this.props.onClose}>✕</button>
          </div>
          <div className="data-controller-credential-subject-view-outer-popup-items">
            <div className="data-controller-credential-subject-view-outer-popup-item-left">
              Credentials
            </div>
            <div className="data-controller-credential-subject-view-outer-popup-item">
              Original Credentials
            </div>
            <div className="data-controller-credential-subject-view-outer-popup-item">
              Subject Modified Credentials
            </div>
          </div>

          <div className="data-controller-credential-subject-view-outer-popup-body">
            <div className="data-controller-credential-subject-view-outer-popup-body-inner">
              <table className="data-controller-credential-subject-view-outer-popup-body-diff-table">
                <tbody className="data-controller-credential-subject-view-outer-popup-body-diff-table-tb">
                  {comparisonItem.map((row, index) => (
                    <tr
                      key={index}
                      className={
                        row.isChanged
                          ? "data-controller-credential-subject-view-outer-popup-body-diff-table-tb-diff-row-changed"
                          : "data-controller-credential-subject-view-outer-popup-body-diff-table-tb-diff-row-unchanged"
                      }
                    >
                      <td className="data-controller-credential-subject-view-outer-popup-body-diff-table-tb-diff-row-data-key">
                        {this.formatKeyLabel(row.key)}
                      </td>
                      <td className="data-controller-credential-subject-view-outer-popup-body-diff-table-tb-diff-row-data">
                        <span className="data-controller-credential-subject-view-outer-popup-body-diff-table-tb-diff-old">
                          {String(row.oldValue)}
                        </span>
                      </td>
                      <td className="data-controller-credential-subject-view-outer-popup-body-diff-table-tb-diff-row-data">
                        <span className="data-controller-credential-subject-view-outer-popup-body-diff-table-tb-diff-new">
                          {String(row.newValue)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="data-controller-credential-subject-view-outer-popup-footer">
            {!isUserProfile && (
              <button type="button" onClick={this.acceptDataSubjectRequest}>Accept</button>
            )}
            <button
              type="button"
              onClick={this.rejectDataSubjectRequest}
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default DataControllerCredentialSubjectView;

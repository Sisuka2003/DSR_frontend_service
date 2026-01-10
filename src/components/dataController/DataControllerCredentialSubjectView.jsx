import React from "react";
import "./DataControllerCredentialSubjectView.scss";

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

  render() {
    const { comparisonItem } = this.props;

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
            <button type="button">Accept</button>
            <button type="button">Reject</button>
          </div>
        </div>
      </div>
    );
  }
}

export default DataControllerCredentialSubjectView;

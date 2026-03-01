import React from "react";
import "./ActionBar.scss";
import DarkenOverlay from "../dashboard/DarkenOverlay";
import ViewAdminProfile from "./ViewAdminProfile";
class ActionBar extends React.Component {
  constructor(props) {
    super();
    this.state = {
      overlay: false,
      popupShow: false,
      activePopup: null,
    };
  }

toggleOverlay = (value) => {
  this.setState((prev) => {
    if (!value) {
      return {
        overlay: false,
        popupShow: false,
        activePopup: null,
      };
    }
    if (prev.activePopup === value) {
      return {
        overlay: false,
        popupShow: false,
        activePopup: null,
      };
    }

    return {
      overlay: true,
      popupShow: true,
      activePopup: value,
    };
  });
};


  render() {
    return (
      <>
        <div className="admin-dashboard-section-controls">
          <div className="admin-dashboard-section-controls-actions">
            <div
              className="admin-dashboard-section-controls-actions-profile"
              onClick={() => this.toggleOverlay("PRFL")}
            ></div>
            <div
              className="admin-dashboard-section-controls-actions-admin-modify"
              onClick={() => this.toggleOverlay("MDFY")}
            ></div>
            <div
              className="admin-dashboard-section-controls-actions-controller"
              onClick={() => this.toggleOverlay("CNTR")}
            ></div>
            <div
              className="admin-dashboard-section-controls-actions-logout"
              onClick={() => this.toggleOverlay("LGT")}
            ></div>
          </div>
        </div>

        {this.state.overlay && <DarkenOverlay isToggled={this.state.overlay} />}
        {this.state.popupShow && (
          <div
            className={`admin-dashboard-section-popup-show ${this.state.popupShow ? "active" : ""}`}
          >
            {this.state.activePopup === "PRFL" && (
              <ViewAdminProfile
                closePopup={this.toggleOverlay}
                mode={this.state.activePopup}
                isViewAdminClicked
              />
            )}

            {this.state.activePopup === "MDFY" && (
              <ViewAdminProfile
                closePopup={this.toggleOverlay}
                mode={this.state.activePopup}
                isModifyOptionClicked
              />
            )}

            {this.state.activePopup === "CNTR" && (
              <ViewAdminProfile
                closePopup={this.toggleOverlay}
                mode={this.state.activePopup}
                isControllerAdditionRequired
              />
            )}

            
            {this.state.activePopup === "LGT" && this.props.handleLogout()}
          </div>
        )}
      </>
    );
  }
}

export default ActionBar;

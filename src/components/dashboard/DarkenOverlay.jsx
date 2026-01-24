import React from "react";

function DarkenOverlay({ isDelete, isModify, checkAlerts }) {
  return (
    <div
      className={`data-controller-profile-overlay ${
        isModify || isDelete || checkAlerts ? "active" : ""
      }`}
    />
  );
}

export default DarkenOverlay;

import React from "react";
import "./DarkenOverlay.scss";

function DarkenOverlay({ isDelete, isModify, checkAlerts, isToggled, cssName }) {
  const isActive = isModify || isDelete || checkAlerts || isToggled;

  return (
    <div
      className={`${cssName || "data-controller-profile-overlay"} ${
        isActive ? "active" : ""
      }`}
    />
  );
}

export default DarkenOverlay;

import React from "react";

function DarkenOverlay({ isDelete, isModify, checkAlerts, cssName }) {
  const isActive = isModify || isDelete || checkAlerts;

  return (
    <div
      className={`${cssName || "data-controller-profile-overlay"} ${
        isActive ? "active" : ""
      }`}
    />
  );
}

export default DarkenOverlay;

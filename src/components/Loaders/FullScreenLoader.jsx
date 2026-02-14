import React from "react";
import "./FullScreenLoader.scss";

const FullScreenLoader = () => {
  return (
    <div className="fullscreen-loader">
      <div className="spinner"></div>
      <p>Processing...</p>
    </div>
  );
};

export default FullScreenLoader;

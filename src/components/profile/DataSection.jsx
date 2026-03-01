import React from "react";

class DataSection extends React.Component {
  render() {
    const { title, entries, isModify, formatKeyLabel } = this.props;

    return (
      <div
        className={`data-section data-section-${title.replace(/\s+/g, "").toLowerCase()}`}
      >
        <div className="data-section-title">
          <h2>{title} Info.</h2>
        </div>
        <div className="data-section-scroll">
          {entries.map(([key, value], index) => (
            <div className="data-row" key={index}>
              <div
                className={
                  isModify
                    ? "data-row-key-cell-reduced-font"
                    : title === "Profile"
                      ? "data-row-key-cell-profile"
                      : "data-row-key-cell"
                }
              >
                {formatKeyLabel(key)}
              </div>

              <div className="data-row-colon">:</div>

              <div
                className={
                  isModify
                    ? "data-row-value-cell-reduced-font"
                    : "data-row-value-cell"
                }
              >
                <span className="value-input">{String(value)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default DataSection;

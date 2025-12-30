import React from "react";
import "./Header.scss";
class Header extends React.Component {
  render() {
    const { openPopup,onHomeClick } = this.props;
    return (
      <div className="header">
        <div className="header-logo"></div>
        <div className="header-directions">
          <p className="pages" onClick={onHomeClick}>Home</p>
          <p className="pages">About Us</p>
          <p className="pages">Get In Touch</p>
          <p className="pages">Support</p>
          <p className="pages" onClick={openPopup}>
            Sign In As Controller
          </p>
        </div>
      </div>
    );
  }
}

export default Header;

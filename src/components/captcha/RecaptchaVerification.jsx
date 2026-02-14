import React, { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

function CaptchaVerifier({ onVerify }) {
  const [captchaValue, setCaptchaValue] = useState(null);

  const handleCaptchaChange = (value) => {
    console.log("Captcha value:", value);
    setCaptchaValue(value);
    if (onVerify) {
      onVerify(value); // send token to parent
    }
  };

  return (
    <div style={{ marginTop: "25px" }}>
      <ReCAPTCHA
        sitekey="6LfMGGAsAAAAAOTL1mJ8HSltu_vZ3fb_9CKMbLbc"
        onChange={handleCaptchaChange}
      />
    </div>
  );
}

export default CaptchaVerifier;

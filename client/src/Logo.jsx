import React from "react";
export default function Logo({ height = 48, className = "", alt = "Institute of Engineering & Management logo" }) {
  return <img src="/iem-logo.png" alt={alt} className={`iem-logo ${className}`} style={{ height }} draggable="false" />;
}

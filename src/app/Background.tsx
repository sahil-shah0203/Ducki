import React from "react";

const Background = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "linear-gradient(to bottom, #417154, #3a5e4d)",
        zIndex: -1,
      }}
    />
  );
};

export default Background;

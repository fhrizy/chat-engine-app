import React from "react";
import axios from "axios";

import X from "../assets/x-lg.svg";
import Download from "../assets/download.svg";
import "../stylesheets/showFile.scss";

function ShowFile({
  fileId,
  previewPage,
  setPreviewPage,
  showFile,
  setShowFile,
}) {
  const user = JSON.parse(localStorage.getItem("user"));

  /* Download file */
  const downloadFile = () => {
    if (fileId !== "") {
      axios
        .get(
          `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/api/download`,
          {
            params: {
              filename: fileId,
              token: user.token,
            },
          }
        )
        .then((res) => {
          window.open(res.data.url);
        });
    }
  };

  return (
    <div className={"show " + (previewPage && "active")}>
      <div className="toggle">
        <img src={Download} alt="download" onClick={() => downloadFile()} />
        <img
          src={X}
          alt="close"
          onClick={() => {
            setPreviewPage(false);
            setShowFile();
          }}
        />
      </div>
      <div className="image">{showFile}</div>
    </div>
  );
}

export default ShowFile;

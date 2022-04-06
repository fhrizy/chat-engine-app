import React, { useState } from "react";
import axios from "axios";

import Message from "./Pages/Message";
import Profile from "./Pages/Profile";
import RoomChat from "./Pages/RoomChat";
import ShowFile from "./Pages/ShowFile";
import Contact from "./Pages/Contact";
import "./app.css";

function App() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [roomId, setRoomId] = useState("");
  const [fileId, setFileId] = useState("");
  const [name, setName] = useState("");
  const [previewPage, setPreviewPage] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [contactMenu, setContactMenu] = useState(false);
  const [showFile, setShowFile] = useState();

  /* Popup file */
  const popupFile = (filename) => {
    if (filename !== "") {
      setPreviewPage(true);
      axios
        .get(
          `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/api/download`,
          {
            params: {
              filename: filename,
              token: user.token,
            },
          }
        )
        .then((res) => {
          if (
            filename.split(".")[1] === "jpg" ||
            filename.split(".")[1] === "jpeg" ||
            filename.split(".")[1] === "png"
          ) {
            setShowFile(<img src={res.data.url} alt="gambar" />);
          } else {
            setShowFile(<video src={res.data.url} controls />);
          }
        });
    }
  };

  return (
    <div className="main-page">
      <ShowFile
        fileId={fileId}
        previewPage={previewPage}
        setPreviewPage={setPreviewPage}
        showFile={showFile}
        setShowFile={setShowFile}
      />
      <Profile
        profileMenu={profileMenu}
        setProfileMenu={setProfileMenu}
        setContactMenu={setContactMenu}
      />
      <Contact
        contactMenu={contactMenu}
        setContactMenu={setContactMenu}
        setRoomId={setRoomId}
        setName={setName}
        setProfileMenu={setProfileMenu}
      />
      <RoomChat
        profileMenu={profileMenu}
        setProfileMenu={setProfileMenu}
        setRoomId={setRoomId}
        setName={setName}
        setContactMenu={setContactMenu}
      />
      <Message
        room={roomId}
        name={name}
        setPreview={(event) => {
          popupFile(event);
          setFileId(event);
        }}
      />
    </div>
  );
}

export default App;

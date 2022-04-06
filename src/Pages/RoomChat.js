import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { socket } from "../socket";
import axios from "axios";

import Files from "../assets/file-earmark-fill.svg";
import Play from "../assets/play-circle-fill.svg";
import Image from "../assets/file-earmark-image.svg";
import List from "../assets/list.svg";

import "../stylesheets/roomChat.scss";

const Chat = ({
  profileMenu,
  setProfileMenu,
  setRoomId,
  setName,
  setContactMenu,
}) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [chat, setChat] = useState([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState();
  let redirect = useHistory();

  /* Axios Get Data Chat List */
  useEffect(() => {
    let mounted = true;

    // const timer = setTimeout(() => {
    //   socket.disconnect();
    //   localStorage.clear();
    //   redirect.push("/");
    //   window.location.reload(false);
    // }, (3600000 * 1));

    const axiosData = async () => {
      await axios
        .get(
          `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/api/get-rooms`,
          {
            params: {
              token: user.token,
            },
          }
        )
        .then((res) => {
          if (mounted) {
            socket.emit("authorize", { token: user.token });
            setChat(res.data);
            newChat(res.data);
            setDate(
              new Date(Date.now()).getFullYear() +
                "-" +
                (new Date(Date.now()).getMonth() + 1 < 10
                  ? "0" + (new Date(Date.now()).getMonth() + 1)
                  : new Date(Date.now()).getMonth() + 1) +
                "-" +
                (new Date(Date.now()).getDate()
                  ? "0" + new Date(Date.now()).getDate()
                  : new Date(Date.now()).getDate())
            );
          }
        })
        .catch((error) => {
          if (error.request.status === 401) {
            socket.disconnect();
            localStorage.clear();
            redirect.push("/");
            window.location.reload(false);
          }
        });
    };
    axiosData();

    return () => {
      mounted = false;
      // clearTimeout(timer);
    };
  }, [user.token, redirect]);

  /* Socket for realtime get last messages */
  const newChat = (oldChat) => {
    socket.emit("get-new-messages");
    socket.on("get-new-messages", (data) => {
      const resChat = [
        ...oldChat.filter((item) => item.id !== data.new_val.id),
        data.new_val,
      ];
      oldChat = resChat;
      setChat(resChat);
    });
    return oldChat.resChat;
  };

  /* Filter for Search Engine Chat List, Order by Message */
  const dataChat = chat.filter((d) => {
    if (search === "") {
      return d;
    } else if (d.name.toLowerCase().includes(search.toLowerCase())) {
      return d;
    }
    return false;
  });

  return (
    <div className="chat-page">
      <div className="chat-header">
        <img
          src={List}
          alt="list"
          onClick={() => setProfileMenu(!profileMenu)}
        />
        <h3>Chat</h3>
      </div>
      <div className="chat-search">
        <input
          type="text"
          placeholder="Search"
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          value={search}
        />
      </div>
      <div className="chat-container">
        {dataChat.length > 0 ? (
          dataChat
            .sort((a, b) => {
              return a.updatedAt < b.updatedAt ? 1 : -1;
            })
            .map(
              (d, i) =>
                d.lastMessage && (
                  <div
                    className="chat-item"
                    key={i}
                    onClick={() => {
                      setRoomId(d.id);
                      setName(d.name);
                    }}
                  >
                    <div className="chat-item-profile">
                      <h1>{d.name.charAt(0).toUpperCase()}</h1>
                    </div>
                    <div className="chat-item-content">
                      <div className="chat-item-content-top">
                        <div className="chat-item-content-top-1">
                          <h2>
                            {d.name.split(" ")[0].charAt(0).toUpperCase() +
                              d.name.slice(1)}
                          </h2>
                          {/* <div className="chat-item-content-top-2">2</div> */}
                        </div>
                        <span>
                          {!d.lastMessage
                            ? ""
                            : d.lastMessage.timeReceived.split("T")[0] === date
                            ? ((Number(
                                d.lastMessage.timeReceived
                                  .split("T")[1]
                                  .split(".")[0]
                                  .split(":")[0]
                              ) +
                                Number(7)) %
                                Number(24)) +
                              ":" +
                              d.lastMessage.timeReceived
                                .split("T")[1]
                                .split(".")[0]
                                .split(":")[1]
                            : false}
                          {!d.lastMessage
                            ? ""
                            : d.lastMessage.timeReceived.split("T")[0] !== date
                            ? d.lastMessage.timeReceived.split("T")[0]
                            : false}
                        </span>
                      </div>
                      <div className="chat-item-content-bottom">
                        {!d.lastMessage ? (
                          ""
                        ) : d.lastMessage.fileId === "" ? (
                          <h3>{d.lastMessage.message}</h3>
                        ) : d.lastMessage.fileId.split(".")[1] === "jpg" ||
                          d.lastMessage.fileId.split(".")[1] === "jpeg" ||
                          d.lastMessage.fileId.split(".")[1] === "png" ? (
                          <div className="message">
                            <img src={Image} alt="gambar" />
                            <h3>Image</h3>
                          </div>
                        ) : d.lastMessage.fileId.split(".")[1] === "mp4" ||
                          d.lastMessage.fileId.split(".")[1] === "mov" ||
                          d.lastMessage.fileId.split(".")[1] === "avi" ? (
                          <div className="message">
                            <img src={Play} alt="video" />
                            <h3>Video</h3>
                          </div>
                        ) : (
                          <div className="message">
                            <img src={Files} alt="files" />
                            <h3>Files</h3>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
            )
        ) : (
          /* End Item Chat List */
          <div className="chat-attribute-add">
            <div className="chat-attribute-search">No Message Found</div>
            <div
              className="chat-attribute-new-message"
              onClick={() => {
                setContactMenu(true);
                setSearch("");
              }}
            >
              Start New Message Here!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;

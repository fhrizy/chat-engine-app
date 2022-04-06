import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { socket } from "../socket";
import axios from "axios";

import Back from "../assets/arrow-left.svg";
import Group from "../assets/people-fill.svg";
import Plus from "../assets/plus.svg";
import Add from "../assets/plus-circle-fill.svg";
import "../stylesheets/contact.scss";

const Contact = ({
  contactMenu,
  setContactMenu,
  setRoomId,
  setName,
  setProfileMenu,
}) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [contact, setContact] = useState([]);
  const [addContact, setAddContact] = useState([]);
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [click, setClick] = useState(false);
  const [groupChat, setGroupChat] = useState(false);
  let redirect = useHistory();

  /* Axios Get Data Contact List */
  useEffect(() => {
    let mounted = true;

    const axiosData = async () => {
      await axios
        .get(
          `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/api/get-contacts`,
          {
            params: {
              token: user.token,
            },
          }
        )
        .then((res) => {
          if (mounted) {
            socket.emit("authorize", { token: user.token });
            setContact(res.data);
            newContact(res.data);
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
    };
  }, [user.token, redirect]);

  /* Socket for realtime get last messages */
  const newContact = (oldContact) => {
    socket.emit("get-new-contacts");
    socket.on("get-new-contacts", (data) => {
      const contactKey = ({ id, name }) => `${id}|${name}`;
      const existing = new Set(oldContact.map(contactKey));
      const resContact = [
        ...oldContact,
        ...data.filter((v) => !existing.has(contactKey(v))),
      ];
      setContact(resContact);
    });
    return oldContact.resContact;
  };

  /* Finding New User with Axios Post Username */
  const find = async () => {
    try {
      const res = await axios.post(
        `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/api/find-user`,
        {
          find_username: search.toLowerCase(),
          token: user.token,
        }
      );
      setClick(true);
      setUserId(res.data.id);
      setAddContact(res.data);
    } catch (error) {
      if (error.request.status === 409) {
        setClick(false);
      }
    }
  };

  /* Adding New User to Contact List with Axios Post Username */
  const add = async () => {
    const res = await axios.post(
      `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/api/add-user`,
      {
        added_id: userId,
        token: user.token,
      }
    );
    setSearch("");
    return res.data;
  };

  /* Axios Find RoomId */
  const findRoom = async (targetId) => {
    const res = await axios.get(
      `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/api/get-roomid`,
      {
        params: {
          targetId: targetId,
          token: user.token,
        },
      }
    );
    if (!res.data) {
      createRoom(targetId);
    } else {
      setRoomId(res.data.id);
    }
  };

  /* Create new room */
  const createRoom = async (targetId) => {
    await axios
      .post(
        `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/api/create-chat-room`,
        {
          roomType: "personal",
          members: [targetId],
          token: user.token,
        }
      )
      .then((res) => {
        setRoomId(res.data.id);
      });
  };

  /* Filter for Search Engine Contact List, Order by Username */
  const dataContact = contact.filter((d) => {
    if (search === "") {
      return d;
    } else if (d.username.toLowerCase().includes(search.toLowerCase())) {
      return d;
    }
    return false;
  });

  return (
    <div className={"contact-page " + (contactMenu && "active")}>
      {/* Start Contact List Page */}
      <div className="contact-header">
        <img
          src={Back}
          alt="back"
          onClick={() => {
            groupChat ? setGroupChat(false) : setContactMenu(false);
            groupChat ? setGroupChat(false) : setProfileMenu(true);
          }}
        />
        {groupChat ? <h3>New Group</h3> : <h3>Contact</h3>}
      </div>
      {!groupChat ? (
        <div className="group-chat" onClick={() => setGroupChat(true)}>
          <div className="image">
            <img className="img1" src={Plus} alt="plus" />
            <img className="img2" src={Group} alt="group" />
          </div>
          <span>New Group</span>
        </div>
      ) : (
        false
      )}
      <div className="contact-search">
        <input
          type="text"
          value={search}
          placeholder="Search"
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && find();
          }}
        />
      </div>
      <div className="contact-container">
        {dataContact.length > 0 ? (
          /* Start Item Contact List */
          dataContact
            .sort((a, b) =>
              a.name.charAt(0).toLowerCase() > b.name.charAt(0).toLowerCase()
                ? 1
                : -1
            )
            .map((d, i) => {
              return (
                <div
                  className="contact-item"
                  key={i}
                  onClick={async () => {
                    setName(d.name);
                    findRoom(d.id);
                    setContactMenu(false);
                  }}
                >
                  <div className="contact-profile">
                    <h1>{d.name.charAt(0).toUpperCase()}</h1>
                  </div>
                  <div className="contact-attribute">
                    <h2>{d.name.charAt(0).toUpperCase() + d.name.slice(1)}</h2>
                    <h3>{d.username}</h3>
                  </div>
                  {groupChat ? <img src={Add} alt="Add" /> : false}
                </div>
              );
            })
        ) : (
          /* End Item Contact List */
          <>
            <div className="contact-find">
              <div
                className="contact-find-2"
                onClick={async () => {
                  await find();
                }}
              >
                Click to Find Contact : {search}
              </div>
            </div>
            {click ? (
              <div className="contact-add">
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="contact-add-1">
                    <h2>{addContact.name}</h2>
                    <h3>{addContact.username}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      setClick(false);
                      await add();
                    }}
                  >
                    Add Contact
                  </button>
                </form>
              </div>
            ) : (
              <div className="contact-add">Username Not Found.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Contact;

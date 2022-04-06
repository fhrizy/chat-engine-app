import React from "react";
import { useHistory } from "react-router";
import { socket } from "../socket";

import Contact from "../assets/person-rolodex.svg";
import Signout from "../assets/box-arrow-left.svg";
// import Group from "../assets/people-fill.svg";
// import Edit from "../assets/pencil-square.svg";
import "../stylesheets/profile.scss";

export const Profile = ({ profileMenu, setProfileMenu, setContactMenu }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  let redirect = useHistory();

  const Logout = () => {
    socket.disconnect();
    localStorage.clear();
    redirect.push("/");
    window.location.reload(false);
  };

  return (
    <div className={"profile-page " + (profileMenu && "active")}>
      <div className="profile-container">
        <div className="profile-photo">
          <h1>{user.name.charAt(0).toUpperCase()}</h1>
        </div>
        <div className="profile-detail">
          <div className="profile-name">
            <h2>{user.name.charAt(0).toUpperCase() + user.name.slice(1)}</h2>
            <h3>{user.username}</h3>
          </div>
          {/* <img src={Edit} alt="Edit" /> */}
          {/* <div className="editProfile">
              <form>
                <input type="text" placeholder="New Name"/>
                <button>Save</button>
              </form>
            </div> */}
        </div>
      </div>
      <div
        className="profile-menu"
        onClick={() => {
          setProfileMenu(false);
          setContactMenu(true);
        }}
      >
        <img src={Contact} alt="contact" />
        <span>Contact</span>
      </div>
      {/* <div
        className="profile-menu"
        onClick={() => {
          setProfileMenu(false);
          setContactMenu(true);
        }}
      >
        <img src={Group} alt="group" />
        <span>New Group Chat</span>
      </div> */}
      <div className="profile-menu" onClick={Logout}>
        <img src={Signout} alt="logout" />
        <span>Logout</span>
      </div>
    </div>
  );
};

export default Profile;

import React, { useState } from "react";
import { useHistory } from "react-router";
import Axios from "axios";

import Header from "../components/header";
import "../stylesheets/regist.scss";

const Regist = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [match, setMatch] = useState(true);

  let redirect = useHistory();

  /* Axios Post for Regist with Name, Username and Password */
  const regist = async () => {
    try {
      const res = await Axios.post(
        `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/api/signup`,
        {
          name: name,
          username: username.toLowerCase(),
          password: confirmPassword,
          level: "user",
        }
      );
      redirect.push("/");
      return res.data;
    } catch (error) {
      if (error.request.status === 400) {
        alert("Please fill the form!");
      } else if (error.request.status === 409) {
        alert("Username already exists!");
      }
    }
  };

  /* Validation for Password and Confirm Password */
  const setValidation = (e) => {
    const confPass = e.target.value;
    setConfirmPassword(confPass);
    if (password.length !== 0) {
      if (password === confPass) {
        setError("");
        setMatch(false);
      } else {
        setError("Password should Match!");
        setMatch(true);
      }
    }
  };

  return (
    <div className="regist-page">
      <Header />
      <div className="regist-container">
        <form onSubmit={(e) => e.preventDefault()}>
          <h4>Name</h4>
          <input
            type="text"
            placeholder="Name"
            onChange={(e) => {
              setName(e.target.value);
            }}
            maxLength={30}
            required
            autoFocus
          />
          <h4>Username</h4>
          <input
            type="text"
            placeholder="Username"
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            maxLength={30}
            required
          />
          <h4>Password</h4>
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            maxLength={12}
            required
          />
          <h4>Confirm Password</h4>
          <input
            type="password"
            placeholder="Confirm Password"
            onChange={setValidation}
            maxLength={12}
            required
          />
          <button
            type="submit"
            onClick={async () => {
              if (name && username && match) {
                alert("Fill the Password or Password Not Match!");
              } else if (name && username && !match) {
                await regist();
              }
            }}
          >
            Sign Up
          </button>
          <div>
            <span>{error}</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Regist;

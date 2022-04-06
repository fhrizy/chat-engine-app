import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { socket } from "../socket";
import Axios from "axios";

import Header from "../components/header";
import "../stylesheets/login.scss";

const Login = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [direct, setDirect] = useState();

  let redirect = useHistory();

  useEffect(() => {
    let mounted = true;

    const directLogin = async () => {
      if (mounted) {
        setDirect(user);
        if (direct) {
          socket.emit("authorize", { token: direct.token });
          redirect.push("/chat");
          window.location.reload(false)
        } else {
          redirect.push("/");
        }
      }
    };
    directLogin();

    return () => {
      mounted = false;
    };
  }, [direct, user, redirect]);

  /* Axios Post for Login with Username and Password */
  const login = async () => {
    try {
      const res = await Axios.post(
        `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.REACT_APP_SERVER_PORT}/api/login`,
        {
          username: username.toLowerCase(),
          password: password,
        }
      );
      socket.connect();
      localStorage.setItem("user", JSON.stringify(res.data));
      socket.emit("authorize", { token: res.data.token });
      redirect.push("/chat");
    } catch (error) {
      if (error.request.status === 400) {
        alert("Please fill username and password!");
      } else if (error.request.status === 409) {
        alert("Invalid User!");
      } else if (error.request.status === 401) {
        alert("Username or Password Invalid!");
      }
    }
  };

  return (
    <div className="login-page">
      <Header />
      <div className="login-container">
        <form onSubmit={(e) => e.preventDefault()}>
          <h4>Username</h4>
          <input
            type="text"
            placeholder="Username"
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            maxLength={30}
            required
            autoFocus
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
          <button
            type="submit"
            onClick={async () => {
              await login();
            }}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

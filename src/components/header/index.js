import React, { useState } from "react";
import "../header/header.scss";

import styled from "styled-components";
import { NavLink } from "react-router-dom";

const SignIn = styled(NavLink)`
  width: 200px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 0 0px 10px;

  font-size: inherit;
  color: inherit;
  text-decoration: none;

  &:hover {
    background-color: #219ebc;
  }
`;
const SignUp = styled(NavLink)`
  width: 200px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 0 10px 0;

  font-size: inherit;
  color: inherit;
  text-decoration: none;

  &:hover {
    background-color: #219ebc;
  }
`;

const Header = () => {
  const [click, setClick] = useState(false);
  return (
    <div className="header-component" clicked={click ? 1 : 0}>
      <SignIn
        onClick={() => setClick(false)}
        exact
        activeClassName="active"
        to="/"
      >
        <h4>Sign In</h4>
      </SignIn>
      <SignUp
        onClick={() => setClick(false)}
        activeClassName="active"
        to="/regist"
      >
        <h4>Sign Up</h4>
      </SignUp>
    </div>
  );
};

export default Header;

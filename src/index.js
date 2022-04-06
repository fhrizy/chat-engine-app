import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Route, Switch } from "react-router";

import Login from "./Pages/Login";
import Regist from "./Pages/Regist";
import App from "./App";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <div className="app">
        <div className="detailitem">
          <Switch>
            <Route exact path="/" component={Login} />
            <Route path="/regist" component={Regist} />
            <Route path="/chat" component={App} />
          </Switch>
        </div>
      </div>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

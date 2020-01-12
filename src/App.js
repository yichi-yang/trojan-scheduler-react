import React from "react";
import "./App.css";
import "semantic-ui-css/semantic.min.css";
import Scheduler from "./Scheduler";
import { BrowserRouter as Router } from "react-router-dom";

function App() {
  return (
    <Router>
      <Scheduler></Scheduler>{" "}
    </Router>
  );
}

export default App;

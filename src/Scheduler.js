import React from "react";
import { Step, Container } from "semantic-ui-react";
import CoursebinWidget from "./CoursebinWidget";
import { Route } from "react-router-dom";
import StepNav from "./StepNav";

class Scheduler extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  redirect(to) {
    this.setState({ redirect: to });
  }

  render() {
    return (
      <Container>
        <Step.Group widths={3}>
          <StepNav
            path="/coursebin"
            icon="list alternate"
            title="Coursebin"
          ></StepNav>
          <StepNav
            path="/preferences"
            icon="setting"
            title="Preferences"
            content="..."
          ></StepNav>
          <StepNav
            path="/results"
            icon="calendar alternate"
            title="Results"
          ></StepNav>
        </Step.Group>

        <Route path="/coursebin" component={CoursebinWidget} exact strict />
      </Container>
    );
  }
}

export default Scheduler;

import React from "react";
import {
  Container,
  Menu,
  Dropdown,
  List,
  Segment,
  Responsive
} from "semantic-ui-react";
import { Route, Switch, NavLink } from "react-router-dom";
import LandingPage from "./LandingPage";
import LoginButton from "./account/LoginButton";
import SignupButton from "./account/SignupButton";

import { SemanticToastContainer } from "react-semantic-toasts";
import "react-semantic-toasts/styles/react-semantic-alert.css";
import OtherPages from "./OtherPages";

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
      <>
        <Menu fixed="top" inverted>
          <Container>
            <Responsive as={React.Fragment} minWidth={700}>
              <Menu.Item as="a" header>
                {/* <Image
                size="mini"
                src="/logo.png"
                style={{ marginRight: "1.5em" }}
              /> */}
                Trojan Scheduler
              </Menu.Item>
              <Menu.Item as={NavLink} to="/" exact>
                Home
              </Menu.Item>
              <Menu.Item as={NavLink} to="/app/">
                App
              </Menu.Item>
              <Menu.Item as={NavLink} to="/task/">
                Tasks
              </Menu.Item>
              <Menu.Item as={NavLink} to="/schedule/">
                Schedules
              </Menu.Item>
            </Responsive>

            <Responsive
              as={Dropdown}
              maxWidth={699}
              item
              simple
              icon="content"
              className="menu-more"
            >
              <Dropdown.Menu>
                <Dropdown.Item as={NavLink} to="/" exact>
                  Home
                </Dropdown.Item>
                <Dropdown.Item as={NavLink} to="/app/" exact>
                  App
                </Dropdown.Item>{" "}
                <Dropdown.Item as={NavLink} to="/task/" exact>
                  Tasks
                </Dropdown.Item>{" "}
                <Dropdown.Item as={NavLink} to="/schedule/" exact>
                  Schedules
                </Dropdown.Item>
              </Dropdown.Menu>
            </Responsive>

            <Menu.Menu position="right">
              <Menu.Item>
                <LoginButton />
                <SignupButton />
              </Menu.Item>
            </Menu.Menu>
          </Container>
        </Menu>

        <Switch>
          <Route path="/" exact component={LandingPage} />=
          <Route component={OtherPages} />
        </Switch>

        <Segment inverted vertical className="footer">
          <Container textAlign="center">
            {/* <Image centered size="mini" src="/logo.png" /> */}
            <List horizontal inverted divided link size="small">
              <List.Item as="a" href="#">
                Home
              </List.Item>
              <List.Item as="a" href="#">
                About
              </List.Item>
            </List>
          </Container>
        </Segment>
        <SemanticToastContainer position="bottom-right" />
      </>
    );
  }
}

export default Scheduler;

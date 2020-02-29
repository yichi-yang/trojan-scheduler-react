import React from "react";
import {
  Container,
  Menu,
  Dropdown,
  List,
  Segment,
} from "semantic-ui-react";
import { Route, useParams, Switch, NavLink } from "react-router-dom";
import SchedulePage from "./schedule/SchedulePage";
import TaskPage from "./schedule/TaskPage";
import NotFound from "./NotFound";
import AppPage from "./app/AppPage";
import LoginButton from "./account/LoginButton";
import SignupButton from "./account/SignupButton";
import TaskListPage from "./schedule/TaskListPage";
import ScheduleListPage from "./schedule/ScheduleListPage";
import { SemanticToastContainer } from "react-semantic-toasts";
import "react-semantic-toasts/styles/react-semantic-alert.css";

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
            <Menu.Item as="a" header>
              {/* <Image
                size="mini"
                src="/logo.png"
                style={{ marginRight: "1.5em" }}
              /> */}
              Project Name
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

            <Dropdown item simple text="Dropdown">
              <Dropdown.Menu>
                <Dropdown.Item>List Item</Dropdown.Item>
                <Dropdown.Item>List Item</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Header>Header Item</Dropdown.Header>
                <Dropdown.Item>
                  <i className="dropdown icon" />
                  <span className="text">Submenu</span>
                  <Dropdown.Menu>
                    <Dropdown.Item>List Item</Dropdown.Item>
                    <Dropdown.Item>List Item</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Item>
                <Dropdown.Item>List Item</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Menu.Menu position="right">
              <Menu.Item>
                <LoginButton />
                <SignupButton />
              </Menu.Item>
            </Menu.Menu>
          </Container>
        </Menu>

        <Container className="main-content">
          <Switch>
            <Route path="/app" component={AppPage} />
            <Route
              path="/task/:id"
              exact
              component={props => {
                let { id } = useParams();
                return <TaskPage task_id={id} {...props} />;
              }}
            />
            <Route
              path="/schedule/:id"
              exact
              component={props => {
                let { id } = useParams();
                return <SchedulePage schedule_id={id} {...props} />;
              }}
            />
            <Route path="/task/" exact component={TaskListPage} />
            <Route path="/schedule/" exact component={ScheduleListPage} />
            <Route component={NotFound} />
          </Switch>
        </Container>

        <Segment
          inverted
          vertical
          className="footer"
        >
          <Container textAlign="center">
            {/* <Image centered size="mini" src="/logo.png" /> */}
            <List horizontal inverted divided link size="small">
              <List.Item as="a" href="#">
                Site Map
              </List.Item>
              <List.Item as="a" href="#">
                Contact Us
              </List.Item>
              <List.Item as="a" href="#">
                Terms and Conditions
              </List.Item>
              <List.Item as="a" href="#">
                Privacy Policy
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

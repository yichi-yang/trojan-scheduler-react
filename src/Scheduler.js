import React from "react";
import {
  Container,
  Menu,
  Dropdown,
  List,
  Grid,
  Segment,
  Header,
  Divider
} from "semantic-ui-react";
import { Route, useParams, Switch, NavLink } from "react-router-dom";
import SchedulePage from "./SchedulePage";
import TaskPage from "./TaskPage";
import NotFound from "./NotFound";
import AppPage from "./AppPage";
import LoginButton from "./LoginButton";
import SignupButton from "./SignupButton";
import TaskListPage from "./TaskListPage";
import ScheduleListPage from "./ScheduleListPage";
import { SemanticToastContainer } from 'react-semantic-toasts';
import 'react-semantic-toasts/styles/react-semantic-alert.css';

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
      <div>
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

        <Container style={{ minHeight: 500, marginTop: "7em" }}>
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
          style={{ margin: "5em 0em 0em", padding: "5em 0em" }}
        >
          <Container textAlign="center">
            <Grid divided inverted stackable>
              <Grid.Column width={3}>
                <Header inverted as="h4" content="Group 1" />
                <List link inverted>
                  <List.Item as="a">Link One</List.Item>
                  <List.Item as="a">Link Two</List.Item>
                  <List.Item as="a">Link Three</List.Item>
                  <List.Item as="a">Link Four</List.Item>
                </List>
              </Grid.Column>
              <Grid.Column width={3}>
                <Header inverted as="h4" content="Group 2" />
                <List link inverted>
                  <List.Item as="a">Link One</List.Item>
                  <List.Item as="a">Link Two</List.Item>
                  <List.Item as="a">Link Three</List.Item>
                  <List.Item as="a">Link Four</List.Item>
                </List>
              </Grid.Column>
              <Grid.Column width={3}>
                <Header inverted as="h4" content="Group 3" />
                <List link inverted>
                  <List.Item as="a">Link One</List.Item>
                  <List.Item as="a">Link Two</List.Item>
                  <List.Item as="a">Link Three</List.Item>
                  <List.Item as="a">Link Four</List.Item>
                </List>
              </Grid.Column>
              <Grid.Column width={7}>
                <Header inverted as="h4" content="Footer Header" />
                <p>
                  Extra space for a call to action inside the footer that could
                  help re-engage users.
                </p>
              </Grid.Column>
            </Grid>

            <Divider inverted section />
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
        <SemanticToastContainer position="bottom-right"/>
      </div>
    );
  }
}

export default Scheduler;

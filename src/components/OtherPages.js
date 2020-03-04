import React from "react";
import { Container } from "semantic-ui-react";
import AccountPage from "./account/AccountPage";
import TaskListPage from "./schedule/TaskListPage";
import SchedulePage from "./schedule/SchedulePage";
import TaskPage from "./schedule/TaskPage";
import NotFound from "./NotFound";
import AppPage from "./app/AppPage";
import ScheduleListPage from "./schedule/ScheduleListPage";
import EmailVerificationPage from "./account/EmailVerificationPage";
import { Route, useParams, Switch } from "react-router-dom";

class OtherPages extends React.Component {
  render() {
    return (
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
          <Route path="/account/" exact component={AccountPage} />
          <Route path="/verify/" exact component={EmailVerificationPage} />
          <Route component={NotFound} />
        </Switch>
      </Container>
    );
  }
}

export default OtherPages;

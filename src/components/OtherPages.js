import React from "react";
import { Container } from "semantic-ui-react";
import AccountPage from "./account/AccountPage";
import TaskListPage from "./schedule/TaskListPage";
import SchedulePage from "./schedule/SchedulePage";
import TaskPage from "./schedule/TaskPage";
import NotFound from "./NotFound";
import WorkInProgress from "./WorkInProgress";
import AppPage from "./app/AppPage";
import ScheduleListPage from "./schedule/ScheduleListPage";
import EmailVerificationPage from "./account/EmailVerificationPage";
import PasswordResetPage from "./account/PasswordResetPage";
import PasswordForgetPage from "./account/PasswordForgetPage";
import About from "./staticPages/About";
import { Route, Switch } from "react-router-dom";

class OtherPages extends React.Component {
  render() {
    return (
      <Container className="main-content">
        <Switch>
          <Route path="/app" component={AppPage} />
          <Route
            path="/task/:id"
            exact
            render={routeProps => (
              <TaskPage task_id={routeProps.match.params.id} {...routeProps} />
            )}
          />
          <Route
            path="/schedule/:id"
            exact
            render={routeProps => (
              <SchedulePage
                schedule_id={routeProps.match.params.id}
                {...routeProps}
              />
            )}
          />
          <Route path="/task/" exact component={TaskListPage} />
          <Route path="/schedule/" exact component={ScheduleListPage} />
          <Route path="/account/" exact component={AccountPage} />
          <Route
            path="/email/verify/"
            exact
            component={EmailVerificationPage}
          />
          <Route path="/password/reset/" exact component={PasswordResetPage} />
          <Route
            path="/password/forget/"
            exact
            component={PasswordForgetPage}
          />
          <Route path="/about/" exact component={About} />
          <Route path="/guide/" exact component={WorkInProgress} />
          <Route path="/faq/" exact component={WorkInProgress} />
          <Route path="/change-log/" exact component={WorkInProgress} />
          <Route path="/contact/" exact component={WorkInProgress} />
          <Route component={NotFound} />
        </Switch>
      </Container>
    );
  }
}

export default OtherPages;

import React from "react";
import { Step } from "semantic-ui-react";
import CoursebinWidget from "./CoursebinWidget";
import { Route, Switch, Redirect } from "react-router-dom";
import StepNav from "./StepNav";
import PreferencesWidget from "./PreferencesWidget";
import ResultsWidget from "./ResultsWidget";
import { join } from "../../util";

class AppPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  redirect(to) {
    this.setState({ redirect: to });
  }

  render() {
    let { path, url } = this.props.match;

    return (
      <>
        <Step.Group widths={3}>
          <StepNav
            path={join(url, "coursebin/")}
            icon="list alternate"
            title="Coursebin"
          ></StepNav>
          <StepNav
            path={join(url, "preferences/")}
            icon="setting"
            title="Preferences"
            content="..."
          ></StepNav>
          <StepNav
            path={join(url, "results/")}
            icon="calendar alternate"
            title="Results"
          ></StepNav>
        </Step.Group>

        <Switch>
          <Route
            path={join(path, "coursebin/")}
            component={CoursebinWidget}
            exact
          />
          <Route
            path={join(path, "preferences/")}
            component={PreferencesWidget}
            exact
          />
          <Route
            path={join(path, "results/")}
            component={ResultsWidget}
            exact
          />
          <Route>
            <Redirect to={join(url, "coursebin/")} push={false} />
          </Route>
        </Switch>
      </>
    );
  }
}

export default AppPage;

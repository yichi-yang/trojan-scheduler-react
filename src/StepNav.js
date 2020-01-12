import React from "react";
import { Step, Icon } from "semantic-ui-react";
import { withRouter, Redirect } from "react-router-dom";

class StepNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />;
    }
    let { pathname: currPath } = this.props.location;
    let { path, icon, title, content } = this.props;
    return (
      <Step
        active={path === currPath}
        onClick={() => this.props.history.push(path)}
      >
        {icon && <Icon name={icon} />}
        <Step.Content>
          {title && <Step.Title>{title}</Step.Title>}
          {content && <Step.Description>{content}</Step.Description>}
        </Step.Content>
      </Step>
    );
  }
}

export default withRouter(StepNav);

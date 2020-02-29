import React from "react";
import { Step, Icon } from "semantic-ui-react";
import { withRouter } from "react-router-dom";
import { addTrailingSlash } from "../../util";

class StepNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    let { pathname: currPath } = this.props.location;
    let { path, icon, title, content } = this.props;
    return (
      <Step
        active={addTrailingSlash(path) === addTrailingSlash(currPath)}
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

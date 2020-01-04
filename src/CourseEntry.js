import React from "react";
import { Accordion, Icon, Button, Label, Loader } from "semantic-ui-react";
import ComponentEntry from "./ComponentEntry";
import { connect } from "react-redux";
import { deleteCourse } from "./actions";

class CourseEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = { active: props.active };
  }

  toggle() {
    this.setState(prev => ({ active: !prev.active }));
  }

  render() {
    let componentsEntries = [];
    for (let component of this.props.children) {
      componentsEntries.push(<ComponentEntry {...component}></ComponentEntry>);
    }
    const colors = [
      "red",
      "yellow",
      "green",
      "blue",
      "purple",
      "brown",
      "orange",
      "olive",
      "teal",
      "violet",
      "pink"
    ];
    let isFinal = !this.props.loading;
    let outdated =
      new Date() - new Date(this.props.course_updated) > 10 * 60 * 1000;
    return (
      <>
        <Accordion.Title
          active={isFinal ? this.state.active : false}
          onClick={() => this.toggle()}
        >
          <Icon name="dropdown" />
          <Label
            color={colors[(this.props.group - 1) % colors.length]}
            horizontal
          >
            {this.props.course_name}
            <Label.Detail>
              {isFinal ? (
                "group " + this.props.group
              ) : (
                <Loader inline active size="mini"></Loader>
              )}
            </Label.Detail>
          </Label>

          {isFinal && (
            <Label circular horizontal>
              {this.props.numActive}
            </Label>
          )}

          {isFinal && outdated && (
            <Label circular horizontal color="yellow">
              <Icon name="warning" color="white" fitted></Icon>
            </Label>
          )}

          {isFinal && (
            <Button.Group size="mini" floated="right" compact>
              <Button>Exclude</Button>
              <Button>All</Button>
              <Button
                color="red"
                course_name={this.props.course_name}
                onClick={(e, props) => {
                  e.stopPropagation();
                  this.props.dispatch(deleteCourse(props.course_name));
                }}
              >
                x
              </Button>
            </Button.Group>
          )}
        </Accordion.Title>
        {isFinal && (
          <Accordion.Content active={this.state.active}>
            <Accordion styled>{componentsEntries}</Accordion>
          </Accordion.Content>
        )}
      </>
    );
  }
}

export default connect((state, ownProps) => ({
  children: state.course.filter(node => node.parent === ownProps.node_id),
  numActive: state.course.filter(
    node =>
      node.course_name === ownProps.course_name &&
      node.type === "section" &&
      !node.exclude
  ).length
}))(CourseEntry);

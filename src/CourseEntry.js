import React from "react";
import { Accordion, Icon, Button, Label, Loader } from "semantic-ui-react";
import PartEntry from "./PartEntry";
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
    let parts = [];
    for (let part of this.props.children) {
      parts.push(<PartEntry {...part}></PartEntry>);
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
            {this.props.course}
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
              <Button icon labelPosition="left">
                <Icon name="eye slash"/>
                Exclude
              </Button>
              <Button>All</Button>
              <Button
                color="red"
                course_name={this.props.course_name}
                onClick={(e, props) => {
                  e.stopPropagation();
                  this.props.delete(this.props.course);
                }}
              >
                x
              </Button>
            </Button.Group>
          )}
        </Accordion.Title>
        {isFinal && (
          <Accordion.Content active={this.state.active}>
            {parts}
          </Accordion.Content>
        )}
      </>
    );
  }
}

export default connect(
  (state, ownProps) => ({
    children: state.course.filter(node => node.parent === ownProps.node_id),
    numActive: state.course.filter(
      node =>
        node.course === ownProps.course &&
        node.type === "section" &&
        !node.exclude
    ).length
  }),
  { delete: deleteCourse }
)(CourseEntry);

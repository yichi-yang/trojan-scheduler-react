import React from "react";
import { Accordion, Icon, Button, Label, Loader } from "semantic-ui-react";
import PartEntry from "./PartEntry";
import { connect } from "react-redux";
import {
  deleteCourse,
  toggleCourseInclude,
  toggleCoursePenalize,
  recursiveSetPenalize
} from "./actions";
import GroupSelect from "./GroupSelect";

const colorScheme = [
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

export const num2color = num =>
  colorScheme[
    (((num - 1) % colorScheme.length) + colorScheme.length) % colorScheme.length
  ];

class CourseEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = { active: props.active };
  }

  toggleActive = () => {
    this.setState(prev => ({ active: !prev.active }));
  };

  removeHandler = e => {
    e.stopPropagation();
    this.props.deleteCourse(this.props.course);
  };

  toggleIncludeHandler = e => {
    e.stopPropagation();
    this.props.toggleCourseInclude(this.props.node_id);
  };

  togglePenaltyHandler = e => {
    e.stopPropagation();
    this.props.recursiveSetPenalize({
      node_id: this.props.node_id,
      exempt: !this.props.exempt
    });
  };

  render() {
    if (this.props.loading) {
      return (
        <Accordion.Title active={false} node_id={this.props.node_id}>
          <Label horizontal>
            {this.props.course}
            <Label.Detail>
              <Loader inline active size="mini"></Loader>
            </Label.Detail>
          </Label>
        </Accordion.Title>
      );
    }
    let parts = [];
    for (let part of this.props.children) {
      parts.push(
        <PartEntry {...part} forceExclude={this.props.exclude}></PartEntry>
      );
    }
    let outdated = new Date() - new Date(this.props.updated) > 10 * 60 * 1000;
    let buttonInclude = this.props.exclude ? (
      <Button content="Include" onClick={this.toggleIncludeHandler} />
    ) : (
      <Button content="Exclude" onClick={this.toggleIncludeHandler} />
    );
    let buttonPenalize = this.props.exempt ? (
      <Button content="Penalize" onClick={this.togglePenaltyHandler} />
    ) : (
      <Button content="Exempt" onClick={this.togglePenaltyHandler} />
    );
    return (
      <>
        <Accordion.Title
          active={this.state.active}
          onClick={this.toggleActive}
          node_id={this.props.node_id}
        >
          <Icon name="dropdown" />
          <Label
            basic={this.props.exclude}
            color={num2color(this.props.group)}
            horizontal
          >
            {this.props.course}
            {this.props.exclude ? " (excluded)" : null}
            <GroupSelect
              options={this.props.groupOptions}
              currentGroup={this.props.group}
              node_id={this.props.node_id}
            />
          </Label>

          <Label circular horizontal>
            {this.props.numActive}
          </Label>

          {outdated && <Icon name="warning circle" color="yellow" size="large"></Icon>}

          <Button.Group size="mini" floated="right" compact>
            {buttonInclude}
            {buttonPenalize}
            <Button
              color="red"
              course_name={this.props.course_name}
              onClick={this.removeHandler}
            >
              x
            </Button>
          </Button.Group>
        </Accordion.Title>

        <Accordion.Content active={this.state.active}>
          {parts}
        </Accordion.Content>
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
  {
    deleteCourse,
    toggleCourseInclude,
    toggleCoursePenalize,
    recursiveSetPenalize
  }
)(CourseEntry);

import React from "react";
import { Accordion, Icon, Table, Checkbox } from "semantic-ui-react";
import { connect } from "react-redux";
import { toggleCourseInclude, toggleCoursePenalize } from "./actions";

class ComponentEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = { active: props.active };
  }

  toggle() {
    this.setState(prev => ({ active: !prev.active }));
  }

  render() {
    let section_rows = [];
    for (let section of this.props.children) {
      let time;
      if (section.start && section.end) {
        time =
          section.start.substring(0, 5) + "-" + section.end.substring(0, 5);
      } else {
        time = "TBD";
      }
      const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      let days = [];
      for (let i in section.days) {
        days.push(weekDays[section.days[i]]);
      }
      section_rows.push(
        <Table.Row key={section.key} onClick={()=>alert(section.node_id)}>
          <Table.Cell disabled={section.exclude}>
            {section.section_id + (section.need_clearance ? "D" : "R")}
          </Table.Cell>
          <Table.Cell disabled={section.exclude}>{days.join(", ")}</Table.Cell>
          <Table.Cell disabled={section.exclude}>{time}</Table.Cell>
          <Table.Cell disabled={section.exclude}>
            {section.registered}
          </Table.Cell>
          <Table.Cell disabled={section.exclude}>
            {section.instructor}
          </Table.Cell>
          <Table.Cell disabled={section.exclude}>{section.location}</Table.Cell>
          <Table.Cell>
            <Checkbox
              key="include"
              label="include"
              checked={!section.exclude}
              node_id={section.node_id}
              onClick={(e, props) => {
                e.stopPropagation();
                this.props.dispatch(toggleCourseInclude(props.node_id));
              }}
            ></Checkbox>
          </Table.Cell>
          <Table.Cell disabled={section.exclude}>
            <Checkbox
              key="penalize"
              label="penalize"
              disabled={section.exclude}
              checked={!section.exempt}
              node_id={section.node_id}
              onClick={(e, props) => {
                e.stopPropagation();
                this.props.dispatch(toggleCoursePenalize(props.node_id));
              }}
            ></Checkbox>
          </Table.Cell>
        </Table.Row>
      );
    }
    return (
      <>
        <Accordion.Title
          active={this.state.active}
          onClick={() => this.toggle()}
        >
          <Icon name="dropdown" />
          {this.props.component_name} ({this.props.numActive}/
          {this.props.children.length})
        </Accordion.Title>
        <Accordion.Content active={this.state.active}>
          <Table celled fixed selectable>
            <Table.Body>{section_rows}</Table.Body>
          </Table>
        </Accordion.Content>
      </>
    );
  }
}

export default connect((state, ownProps) => ({
  children: state.course.filter(node => node.parent === ownProps.node_id),
  numActive: state.course.filter(
    node => node.parent === ownProps.node_id && !node.exclude
  ).length
}))(ComponentEntry);

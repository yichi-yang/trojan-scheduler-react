import React from "react";
import {
  Container,
  Input,
  Button,
  Grid,
  Accordion,
  Message
} from "semantic-ui-react";
import CourseEntry from "./CourseEntry";
import {
  addCourse,
  addLoadingCourse,
  removeLoadingCourse,
  addMessage,
  removeMessage
} from "./actions";
import { connect } from "react-redux";

class TestWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = { courses: [], term: "", course: "" };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.dispatch(addLoadingCourse(this.state.course));
    fetch("/api/courses/" + this.state.term + "/" + this.state.course + "/", {
      method: "PUT"
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(
          response.status +
            " cannot fetch " +
            this.state.term +
            "/" +
            this.state.course
        );
      })
      .then(data => {
        this.props.dispatch(removeLoadingCourse(this.state.course));
        this.props.dispatch(addCourse(data));
      })
      .catch(error => {
        this.props.dispatch(removeLoadingCourse(this.state.course));
        this.props.dispatch(addMessage(error.message));
        setTimeout(
          () => this.props.dispatch(removeMessage(error.message)),
          10000
        );
      });
  }

  handleTermChange(e) {
    this.setState({ term: e.target.value });
  }

  handleCourseChange(e) {
    this.setState({ course: e.target.value });
  }

  transformCourseData(course) {
    let result = { course_name: course.name, course_term: course.term };
    let components = new Map();
    for (let section of course.sections) {
      if (!components.has(section.section_type)) {
        components.set(section.section_type, {
          component_name: section.section_type,
          sections: []
        });
      }
      components.get(section.section_type).sections.push(section);
    }
    result.components = [];
    for (let section of course.sections) {
      if (components.has(section.section_type)) {
        result.components.push(components.get(section.section_type));
        components.delete(section.section_type);
      }
    }
    return result;
  }

  render() {
    let courseEntries = [];
    for (let course of this.props.children) {
      courseEntries.push(<CourseEntry {...course}></CourseEntry>);
    }
    if (this.props.children.length === 0) {
      courseEntries = (
        <>
          <Accordion.Title active>Empty</Accordion.Title>
        </>
      );
    }
    let messages = [];
    for (let message of this.props.messages) {
      messages.push(<Message>{message}</Message>);
    }
    return (
      <Container>
        <Grid>
          <Grid.Row>
            <Grid.Column width={7}>
              <Input
                placeholder="term"
                onChange={e => this.handleTermChange(e)}
                value={this.state.term}
                fluid
              />
            </Grid.Column>
            <Grid.Column width={7}>
              <Input
                placeholder="course"
                onChange={e => this.handleCourseChange(e)}
                value={this.state.course}
                fluid
              />
            </Grid.Column>
            <Grid.Column width={2}>
              <Button onClick={this.handleClick} fluid>
                Click Here
              </Button>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Accordion styled fluid exclusive={false}>
                {courseEntries}
              </Accordion>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>{messages}</Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }

  // componentDidMount() {
  //   this.props.dispatch(addLoadingCourse("csci-111"));
  // }
}

export default connect(state => ({
  children: state.course
    .filter(node => node.type === "course")
    .sort((a, b) =>
      a.group !== b.group
        ? a.group - b.group
        : a.course_name.localeCompare(b.course_name)
    ),
  messages: state.message
}))(TestWidget);

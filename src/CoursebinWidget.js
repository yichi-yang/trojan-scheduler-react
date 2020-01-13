import React from "react";
import {
  Container,
  Form,
  Accordion,
  Message,
  Segment,
  Header
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
import shortid from "shortid";

class CoursebinWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = { courses: [], term: "", course: "" };
  }

  handleSubmit() {
    let course = this.state.course.trim();
    let term = this.state.term.trim();
    if (!term || !course) {
      this.displayMessage({
        content: '"Term" and "Course" must not be empty.',
        error: true
      });
      return;
    }
    this.props.addLoadingCourse(course);
    fetch(`/api/courses/${term}/${course}/`, {
      method: "PUT"
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(
          `[${response.status}] failed to fetch ${term}:${course}`
        );
      })
      .then(data => {
        this.props.removeLoadingCourse(course);
        this.props.addCourse(data);
      })
      .catch(error => {
        this.props.removeLoadingCourse(course);
        this.displayMessage({
          content: error.message,
          error: true
        });
      });
  }

  handleChange(e, { name, value }) {
    this.setState({ [name]: value });
  }

  displayMessage(message) {
    let messageId = shortid.generate();
    message.key = messageId;
    this.props.addMessage(message);
    setTimeout(() => this.props.removeMessage(messageId), 10000);
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
      messages.push(<Message {...message}></Message>);
    }
    return (
      <Container>
        <Segment.Group>
          <Segment>
            <Header>Add Course</Header>
            <Form onSubmit={e => this.handleSubmit(e)}>
              <Form.Group>
                <Form.Input
                  placeholder="Term"
                  name="term"
                  value={this.state.term}
                  onChange={(e, props) => this.handleChange(e, props)}
                  width={6}
                />
                <Form.Input
                  placeholder="Course"
                  name="course"
                  value={this.state.course}
                  onChange={(e, props) => this.handleChange(e, props)}
                  width={6}
                />
                <Form.Button content="Submit" width={4} fluid />
              </Form.Group>
            </Form>
          </Segment>

          <Segment>
            <Header>Coursebin</Header>
            <Accordion styled fluid exclusive={false}>
              {courseEntries}
            </Accordion>
          </Segment>

          {messages.length !== 0 && <Segment>{messages.reverse()}</Segment>}
        </Segment.Group>
      </Container>
    );
  }

  // componentDidMount() {
  //   this.props.dispatch(addLoadingCourse("csci-111"));
  // }
}

export default connect(
  state => ({
    children: state.course
      .filter(node => node.type === "course")
      .sort((a, b) =>
        a.group !== b.group
          ? a.group - b.group
          : a.node_id.localeCompare(b.node_id)
      ),
    messages: state.message
  }),
  {
    addCourse,
    addLoadingCourse,
    removeLoadingCourse,
    addMessage,
    removeMessage
  }
)(CoursebinWidget);

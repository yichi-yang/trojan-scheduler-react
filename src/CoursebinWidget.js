import React from "react";
import {
  Container,
  Form,
  Accordion,
  Message,
  Segment,
  Header,
  Icon
} from "semantic-ui-react";
import CourseEntry from "./CourseEntry";
import {
  addCourse,
  setIncludeCourse,
  setGroupCourse,
  resetCourseGroup,
  startGroupFromOne
} from "./actions";
import { connect } from "react-redux";
import shortid from "shortid";

class CoursebinWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: [],
      message: [],
      term: "",
      course: "",
      toolsOpen: true,
      assignGroup: false,
      newGroupId: null
    };
  }

  addLoading = course => {
    if (!this.state.loading.includes(course)) {
      this.setStateAsync(state => ({
        ...state,
        loading: state.loading.concat(course)
      }));
    }
  };

  removeLoading = course => {
    this.setStateAsync(state => ({
      ...state,
      loading: state.loading.filter(item => item !== course)
    }));
  };

  handleSubmit() {
    let course = this.state.course.trim().toLowerCase();
    let term = this.state.term.trim();
    if (!term || !course) {
      this.displayMessage({
        content: '"Term" and "Course" must not be empty.',
        error: true
      });
      return;
    } else if (this.state.loading.includes(course)) {
      this.displayMessage({
        content: course.toUpperCase() + " is loading.",
        warning: true
      });
      return;
    }
    this.addLoading(course);
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
        this.removeLoading(course);
        this.props.addCourse(data);
      })
      .catch(error => {
        this.removeLoading(course);
        this.displayMessage({
          content: error.message,
          error: true
        });
      });
  }

  handleChange(e, { name, value }) {
    this.setState({ [name]: value });
  }

  displayMessage = message => {
    let messageId = shortid.generate();
    message.key = messageId;
    this.setStateAsync(state => ({
      ...state,
      message: state.message.concat(message)
    }));
    setTimeout(() => this.removeMessage(messageId), 10000);
  };

  removeMessage = messageId => {
    this.setStateAsync(state => ({
      ...state,
      message: state.message.filter(message => message.key !== messageId)
    }));
  };

  toggleToolSegment = () => {
    this.setState({ toolsOpen: !this.state.toolsOpen });
  };

  setGroupHandlerCreator = group => {
    return (e, { node_id }) => {
      this.props.setGroupCourse({ node_id, group });
    };
  };

  setStateAsync = (arg, callback) => {
    if (this._mounted) {
      this.setState(arg, callback);
    }
  };

  componentDidMount = () => {
    this._mounted = true;
  };

  componentWillUnmount = () => {
    this._mounted = false;
  };

  render() {
    let groupOptions = [
      ...new Set(
        this.props.children
          .filter(node => !node.loading)
          .map(node => node.group)
      )
    ];
    let courseEntries = this.props.children.map(course => (
      <CourseEntry
        assignGroup={this.state.assignGroup}
        assignGroupHandler={this.setGroupHandlerCreator(this.state.newGroupId)}
        groupOptions={groupOptions}
        {...course}
      />
    ));
    let loadingCourses = this.state.loading.map(course => (
      <CourseEntry course={course} loading key={course} />
    ));

    if (this.props.children.length === 0 && this.state.loading.length === 0) {
      courseEntries = (
        <>
          <Accordion.Title active>Empty</Accordion.Title>
        </>
      );
    }
    let messages = this.state.message.map(message => (
      <Message {...message}></Message>
    ));
    return (
      <Container>
        <Segment.Group>
          <Segment>
            <Header>Add Course</Header>
            <Form onSubmit={e => this.handleSubmit(e)}>
              <Form.Group inline>
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
            <Accordion>
              <Accordion.Title
                as={Header}
                active={this.state.toolsOpen}
                onClick={this.toggleToolSegment}
                style={{ marginBottom: "0" }}
              >
                <Icon name="dropdown" />
                Tools
              </Accordion.Title>
              <Accordion.Content
                active={this.state.toolsOpen}
                style={{ marginTop: "14px" }}
              >
                <Form>
                  <Form.Group inline>
                    <Form.Button
                      content="Save"
                      fluid
                      onClick={() => this.props.resetCourseGroup()}
                    />
                    <Form.Button
                      content="Load"
                      fluid
                      onClick={() => this.props.startGroupFromOne()}
                    />
                    <Form.Button
                      content="Refresh All"
                      fluid
                      onClick={() => this.props.setIncludeCourse(true)}
                    />
                  </Form.Group>
                  <Form.Group inline widths="equal">
                    <Form.Button
                      content="Reset Groups"
                      fluid
                      onClick={() => this.props.resetCourseGroup()}
                    />
                    <Form.Button
                      content="Start from 1"
                      fluid
                      onClick={() => this.props.startGroupFromOne()}
                    />
                    <Form.Button
                      content="Select All"
                      fluid
                      onClick={() => this.props.setIncludeCourse(true)}
                    />
                    <Form.Button
                      content="Deselect All"
                      fluid
                      onClick={() => this.props.setIncludeCourse(false)}
                    />
                    <Form.Button
                      content="Penalize All"
                      fluid
                      onClick={() => this.props.setIncludeCourse(true)}
                    />
                    <Form.Button
                      content="Exempt All"
                      fluid
                      onClick={() => this.props.setIncludeCourse(false)}
                    />
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Input
                      placeholder="cleared sections"
                      fluid
                      width={10}
                    />
                    <Form.Checkbox label="Exclude Closed" width={2} />
                    <Form.Checkbox label="Cleared Only" width={2} />
                    <Form.Button
                      content="Filter"
                      fluid
                      onClick={() => this.props.setIncludeCourse(false)}
                      width={2}
                    />
                  </Form.Group>
                  <Form.Group inline>
                    <Form.Input
                      placeholder="cleared sections"
                      fluid
                      width={14}
                    />
                    <Form.Button
                      content="Exempt"
                      fluid
                      onClick={() => this.props.setIncludeCourse(false)}
                      width={2}
                    />
                  </Form.Group>
                </Form>
              </Accordion.Content>
            </Accordion>
          </Segment>

          <Segment>
            <Header>Coursebin</Header>
            <Accordion styled fluid exclusive={false}>
              {courseEntries}
              {loadingCourses}
            </Accordion>
          </Segment>

          {this.state.message.length > 0 && (
            <Segment>{messages.reverse()}</Segment>
          )}
        </Segment.Group>
      </Container>
    );
  }
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
    setIncludeCourse,
    setGroupCourse,
    resetCourseGroup,
    startGroupFromOne
  }
)(CoursebinWidget);

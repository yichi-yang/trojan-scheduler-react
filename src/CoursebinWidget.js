import React from "react";
import {
  Container,
  Form,
  Accordion,
  Segment,
  Header,
  Icon,
  Message
} from "semantic-ui-react";
import CourseEntry from "./CourseEntry";
import {
  addCourse,
  setIncludeCourse,
  setGroupCourse,
  resetCourseGroup,
  startGroupFromOne,
  setUserProfile,
  loadCoursebin,
  loadPreferences
} from "./actions";
import { connect } from "react-redux";
import axios from "axios";
import { termOptions, defaultTerm } from "./settings";
import {
  errorFormatterCreator,
  responseDataFormatter,
  statusCodeFormatter
} from "./util";
import { toast } from "react-semantic-toasts";

const errorFormatter = errorFormatterCreator(
  responseDataFormatter,
  statusCodeFormatter
);

class CoursebinWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingCourses: [],
      term: defaultTerm,
      course: "",
      toolsOpen: false,
      assignGroup: false,
      newGroupId: null,
      loading: []
    };
    this.cancelSource = axios.CancelToken.source();
  }

  addLoading = course => {
    if (!this.state.loadingCourses.includes(course)) {
      this.setState(state => ({
        ...state,
        loadingCourses: state.loadingCourses.concat(course)
      }));
    }
  };

  removeLoading = course => {
    this.setState(state => ({
      loadingCourses: state.loadingCourses.filter(item => item !== course)
    }));
  };

  fetchCourse = (course, term) => {
    this.addLoading(course);
    return axios
      .put(
        `/api/courses/${term}/${course}/`,
        {},
        { cancelToken: this.cancelSource.token }
      )
      .then(response => {
        this.removeLoading(course);
        this.props.addCourse(response.data);
      })
      .catch(error => {
        this.removeLoading(course);
        toast({
          type: "error",
          icon: "times",
          title: `Cannot Load ${course.toUpperCase()}`,
          description: errorFormatter(error),
          time: 10000
        });
      });
  };

  handleFetchCourse() {
    let course = this.state.course.trim().toLowerCase();
    let term = this.state.term.trim();
    if (!term || !course || this.state.loadingCourses.includes(course)) {
      return;
    }
    this.fetchCourse(course, term);
  }

  handleRefreshAll = () => {
    this.setState(state => ({
      loading: state.loading.concat("refresh")
    }));
    Promise.allSettled(
      this.props.courses
        .filter(course => new Date() - new Date(course.updated) > 5 * 60 * 1000)
        .map(course => this.fetchCourse(course.course, course.term))
    ).then(() => {
      this.setState(state => ({
        loading: state.loading.filter(item => item !== "refresh")
      }));
    });
  };

  handleSaveCoursebin = () => {
    let { profile } = this.props;
    if (!profile || !profile.saved_task_data) {
      console.log("No account.");
      return;
    }
    this.setState(state => ({
      loading: state.loading.concat("save")
    }));
    axios
      .patch(
        `/api/task-data/${profile.saved_task_data}/`,
        {
          coursebin: this.props.coursebin,
          preference: this.props.preference
        },
        { cancelToken: this.cancelSource.token }
      )
      .then(response => {
        this.setState(state => ({
          loading: state.loading.filter(item => item !== "save")
        }));
        this.props.setUserProfile(response.data);
      })
      .catch(error => {
        toast({
          type: "error",
          icon: "times",
          title: `Failed to Save Settings`,
          description: errorFormatter(error),
          time: 10000
        });
        this.setState(state => ({
          loading: state.loading.filter(item => item !== "save")
        }));
      });
  };

  handleLoadCoursebin = () => {
    let { profile } = this.props;
    if (!profile || !profile.saved_task_data) {
      console.log("No account.");
      return;
    }
    this.setState(state => ({
      loading: state.loading.concat("load")
    }));
    axios
      .get(`/api/task-data/${profile.saved_task_data}/`, {
        cancelToken: this.cancelSource.token
      })
      .then(response => {
        this.setState(state => ({
          loading: state.loading.filter(item => item !== "load")
        }));
        this.props.loadCoursebin(response.data.coursebin);
        this.props.loadPreferences(response.data.preference);
      })
      .catch(error => {
        toast({
          type: "error",
          icon: "times",
          title: `Failed to Load Settings`,
          description: errorFormatter(error),
          time: 10000
        });
        this.setState(state => ({
          loading: state.loading.filter(item => item !== "load")
        }));
      });
  };

  handleChange(e, { name, value }) {
    this.setState({ [name]: value });
  }

  toggleToolSegment = () => {
    this.setState({ toolsOpen: !this.state.toolsOpen });
  };

  setGroupHandlerCreator = group => {
    return (e, { node_id }) => {
      this.props.setGroupCourse({ node_id, group });
    };
  };

  componentWillUnmount() {
    this.cancelSource.cancel("axios requests cancelled on coursebin unmount");
  }

  render() {
    let groupOptions = [...new Set(this.props.courses.map(node => node.group))];
    let courseEntries = this.props.courses.map(course => (
      <CourseEntry
        assignGroup={this.state.assignGroup}
        assignGroupHandler={this.setGroupHandlerCreator(this.state.newGroupId)}
        groupOptions={groupOptions}
        {...course}
      />
    ));
    let loadingCourseMessage = this.state.loadingCourses.length ? (
      <Message
        info
        content={`Loading courses: ${this.state.loadingCourses
          .map(str => str.toUpperCase())
          .join(", ")}`}
      />
    ) : null;

    if (
      this.props.courses.length === 0
    ) {
      courseEntries = (
        <>
          <Accordion.Title active>Empty</Accordion.Title>
        </>
      );
    }
    return (
      <Container>
        <Segment.Group>
          <Segment>
            <Header>Add Course</Header>
            <Form onSubmit={e => this.handleFetchCourse(e)}>
              <Form.Group inline>
                <Form.Select
                  name="term"
                  value={this.state.term}
                  options={termOptions}
                  onChange={(e, props) => this.handleChange(e, props)}
                  width={6}
                  selection
                  style={{ width: "100%" }}
                />
                <Form.Input
                  placeholder="Course"
                  name="course"
                  value={this.state.course}
                  onChange={(e, props) => this.handleChange(e, props)}
                  width={6}
                />
                <Form.Button
                  content="Submit"
                  width={4}
                  fluid
                  disabled={!this.state.course}
                />
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
                  <Form.Group>
                    <Form.Button
                      content="Save"
                      fluid
                      onClick={this.handleSaveCoursebin}
                      loading={this.state.loading.includes("save")}
                      disabled={this.state.loading.includes("save")}
                      width={3}
                    />
                    <Form.Button
                      content="Load"
                      fluid
                      onClick={this.handleLoadCoursebin}
                      loading={this.state.loading.includes("load")}
                      disabled={this.state.loading.includes("load")}
                      width={3}
                    />
                    <Form.Button
                      content="Refresh All"
                      fluid
                      loading={this.state.loading.includes("refresh")}
                      disabled={this.state.loading.includes("refresh")}
                      onClick={this.handleRefreshAll}
                      width={3}
                    />
                  </Form.Group>
                  <Form.Field style={{ margin: 0 }}>
                    <label>Cleared sections</label>
                  </Form.Field>
                  <Form.Group inline>
                    <Form.Input
                      placeholder="csci-201, csci-201.lab, 29979, etc."
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
                  <Form.Field style={{ margin: 0 }}>
                    <label>Exempted courses, components, or sections</label>
                  </Form.Field>
                  <Form.Group inline>
                    <Form.Input
                      placeholder="math-407, quiz, 29979, etc."
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
            {loadingCourseMessage}
            <Accordion styled fluid exclusive={false}>
              {courseEntries}
            </Accordion>
          </Segment>
        </Segment.Group>
      </Container>
    );
  }
}

export default connect(
  state => ({
    courses: state.course
      .filter(node => node.type === "course")
      .sort((a, b) =>
        a.group !== b.group
          ? a.group - b.group
          : a.node_id.localeCompare(b.node_id)
      ),
    coursebin: state.course,
    preference: state.preference,
    profile: state.user.profile
  }),
  {
    addCourse,
    setIncludeCourse,
    setGroupCourse,
    resetCourseGroup,
    startGroupFromOne,
    setUserProfile,
    loadCoursebin,
    loadPreferences
  }
)(CoursebinWidget);

import React from "react";
import {
  Container,
  Form,
  Accordion,
  Segment,
  Header,
  Icon,
  Message,
  Transition,
  Popup,
  Button
} from "semantic-ui-react";
import CourseEntry from "./CourseEntry";
import {
  addCourse,
  setIncludeCourse,
  setGroupCourse,
  loadCoursebin,
  loadPreferences,
  editSetting,
  filterSelection,
  filterPenalize,
  loadSetting
} from "./actions";
import { connect } from "react-redux";
import axios from "axios";
import { termOptions, defaultTerm } from "./settings";
import {
  errorFormatterCreator,
  responseDataFormatter,
  statusCodeFormatter,
  customMessageFormatter
} from "./util";
import { toast } from "react-semantic-toasts";

const errorFormatter = errorFormatterCreator(
  customMessageFormatter("Your session has expired. Log in to continue.", [
    401
  ]),
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
          list: errorFormatter(error).split("\n"),
          time: 10000
        });
      });
  };

  handleFetchCourse() {
    let course = this.props.setting.course.trim().toLowerCase();
    let term = this.props.setting.term;
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
        .filter(this.needRefresh)
        .map(course => this.fetchCourse(course.course, course.term))
    ).then(() => {
      this.setState(state => ({
        loading: state.loading.filter(item => item !== "refresh")
      }));
    });
  };

  needRefresh = course => new Date() - new Date(course.updated) > 5 * 60 * 1000;

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
          preference: this.props.preference,
          setting: this.props.setting
        },
        { cancelToken: this.cancelSource.token }
      )
      .then(response => {
        this.setState(state => ({
          loading: state.loading.filter(item => item !== "save")
        }));
        toast({
          type: "success",
          icon: "cloud upload",
          title: "Settings Saved",
          description: "Successfully saved your settings.",
          time: 10000
        });
      })
      .catch(error => {
        toast({
          type: "error",
          icon: "times",
          title: `Failed to Save Settings`,
          list: errorFormatter(error).split("\n"),
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
        this.props.loadSetting(response.data.setting);
        toast({
          type: "success",
          icon: "cloud download",
          title: "Settings Loaded",
          description: "Successfully loaded your settings.",
          time: 10000
        });
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

  handleSettingChange = (e, { name, value }) => {
    this.props.editSetting({ name, value });
  };

  toggleToolSegment = () => {
    this.setState({ toolsOpen: !this.state.toolsOpen });
  };

  setGroupHandlerCreator = group => {
    return (e, { node_id }) => {
      this.props.setGroupCourse({ node_id, group });
    };
  };

  handleFilterSelection = () => {
    let { clearedSections, clearedOnly, excludeClosed } = this.props.setting;
    this.props.filterSelection({ clearedOnly, clearedSections, excludeClosed });
  };

  handleFilterPenalize = () => {
    let { exemptedSections } = this.props.setting;
    this.props.filterPenalize(exemptedSections);
  };

  componentWillUnmount() {
    this.cancelSource.cancel("axios requests cancelled on coursebin unmount");
  }

  render() {
    let {
      term,
      course,
      toolsOpen,
      clearedSections,
      clearedOnly,
      excludeClosed,
      exemptedSections
    } = this.props.setting;

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

    if (this.props.courses.length === 0) {
      courseEntries = (
        <>
          <Accordion.Title active>Empty</Accordion.Title>
        </>
      );
    }

    let canRefresh = this.props.courses.filter(this.needRefresh).length > 0;

    let courseSuggestion = null;
    let correctCourseFormat = false;
    if (course.length !== 0) {
      let match = course.match(/([a-zA-Z]{2,4})([\W_]*)(\d{1,3}[a-zA-Z]{0,1})/);
      if (match) {
        if (match[2] !== "-") {
          courseSuggestion = match[1] + "-" + match[3];
        } else {
          correctCourseFormat = true;
        }
      }
    } else {
      correctCourseFormat = true;
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
                  value={term}
                  options={termOptions}
                  onChange={this.handleSettingChange}
                  width={6}
                  selection
                  style={{ width: "100%" }}
                />
                <Popup
                  open={Boolean(courseSuggestion)}
                  position="top center"
                  trigger={
                    <Form.Input
                      placeholder="Course"
                      name="course"
                      value={course}
                      onChange={this.handleSettingChange}
                      width={6}
                      error={!correctCourseFormat}
                    />
                  }
                >
                  Do you mean{" "}
                  <Button
                    style={{
                      backgroundColor: "#0000",
                      padding: "0 0.5em",
                      textDecoration: "underline"
                    }}
                    onClick={e => {
                      e.preventDefault();
                      this.props.editSetting({
                        name: "course",
                        value: courseSuggestion
                      });
                    }}
                  >
                    {courseSuggestion}
                  </Button>
                  ?
                </Popup>
                <Form.Button
                  content="Submit"
                  width={4}
                  fluid
                  disabled={!course}
                />
              </Form.Group>
            </Form>
          </Segment>

          <Segment>
            <Accordion>
              <Accordion.Title
                as={Header}
                active={toolsOpen}
                onClick={this.handleSettingChange}
                value={!toolsOpen}
                name="toolsOpen"
                style={{ marginBottom: "0" }}
              >
                <Icon name="dropdown" />
                Tools
              </Accordion.Title>
              <Accordion.Content
                active={toolsOpen}
                style={{ marginTop: "14px" }}
              >
                <Form>
                  <Form.Group>
                    <Form.Button
                      content="Save"
                      fluid
                      onClick={this.handleSaveCoursebin}
                      loading={this.state.loading.includes("save")}
                      disabled={
                        this.state.loading.includes("save") ||
                        !this.props.profile
                      }
                      width={3}
                    />
                    <Form.Button
                      content="Load"
                      fluid
                      onClick={this.handleLoadCoursebin}
                      loading={this.state.loading.includes("load")}
                      disabled={
                        this.state.loading.includes("load") ||
                        !this.props.profile
                      }
                      width={3}
                    />
                    <Form.Button
                      content="Refresh All"
                      fluid
                      loading={this.state.loading.includes("refresh")}
                      disabled={
                        this.state.loading.includes("refresh") || !canRefresh
                      }
                      onClick={this.handleRefreshAll}
                      width={3}
                    />
                  </Form.Group>
                  <Form.Field style={{ margin: 0 }}>
                    <label>Cleared sections</label>
                  </Form.Field>
                  <Form.Group inline>
                    <Form.Input
                      placeholder="csci-201, csci-201:lab, 29979, etc."
                      fluid
                      width={10}
                      name="clearedSections"
                      value={clearedSections}
                      onChange={this.handleSettingChange}
                    />
                    <Form.Checkbox
                      label="Exclude Closed"
                      width={2}
                      name="excludeClosed"
                      checked={excludeClosed}
                      onChange={(e, { name }) =>
                        this.handleSettingChange(e, {
                          name,
                          value: !excludeClosed
                        })
                      }
                    />
                    <Form.Checkbox
                      label="Cleared Only"
                      width={2}
                      name="clearedOnly"
                      checked={clearedOnly}
                      onChange={(e, { name }) =>
                        this.handleSettingChange(e, {
                          name,
                          value: !clearedOnly
                        })
                      }
                    />
                    <Form.Button
                      content="Filter"
                      fluid
                      onClick={this.handleFilterSelection}
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
                      name="exemptedSections"
                      value={exemptedSections}
                      onChange={this.handleSettingChange}
                    />
                    <Form.Button
                      content="Exempt"
                      fluid
                      onClick={this.handleFilterPenalize}
                      width={2}
                    />
                  </Form.Group>
                </Form>
              </Accordion.Content>
            </Accordion>
          </Segment>

          <Segment>
            <Header>Coursebin</Header>
            <Transition.Group animation="fade down" duration={200}>
              {loadingCourseMessage}
            </Transition.Group>
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
    profile: state.user.profile,
    setting: state.setting
  }),
  {
    addCourse,
    setIncludeCourse,
    setGroupCourse,
    loadCoursebin,
    loadPreferences,
    editSetting,
    filterSelection,
    filterPenalize,
    loadSetting
  }
)(CoursebinWidget);

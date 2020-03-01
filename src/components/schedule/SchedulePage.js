import React from "react";
import {
  Placeholder,
  Segment,
  Message,
  Header,
  Loader
} from "semantic-ui-react";
import ScheduleWidget from "./ScheduleWidget";
import RedirectButton from "../RedirectButton";
import DetailWidget from "./DetailWidget";
import moment from "moment";
import { connect } from "react-redux";
import axios from "axios";
import {
  errorFormatterCreator,
  responseDataFormatter,
  statusCodeFormatter,
  noPermissionFormatter,
  str2para,
  getScheduleName
} from "../../util";
import { scheduleSectionLifetime } from "../../settings";

const errorFormatter = errorFormatterCreator(
  noPermissionFormatter(
    "You cannot view or edit this schedule because it is private."
  ),
  responseDataFormatter,
  statusCodeFormatter
);

class SchedulePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scheduleData: null,
      scheduleUser: null,
      error: null,
      updatingCourse: []
    };
    if (!props.schedule_id) {
      this.state.error = "no schedule id in props";
    }
    this.cancelSource = axios.CancelToken.source();
  }

  loadScheduleData = () => {
    if (this.props.schedule_id) {
      console.log("load");
      axios
        .get(`/api/schedules/${this.props.schedule_id}/`, {
          cancelToken: this.cancelSource.token
        })
        .then(response => {
          let { data } = response;
          this.setState({ scheduleData: data });
          if (data.sections) {
            this.updateExpiredSections(data.sections);
          }
          if (data.user) {
            axios
              .get(`/api/users/${data.user}/`, {
                cancelToken: this.cancelSource.token
              })
              .then(response => this.setState({ scheduleUser: response.data }));
          } else {
            this.setState({
              scheduleUser: {
                avatar: "https://avatars.dicebear.com/v2/bottts/Empty.svg",
                display_name: "Anonymous"
              }
            });
          }
        })
        .catch(error => {
          this.setState({
            error: errorFormatter(error)
          });
        });
    }
  };

  updateExpiredSections = sections => {
    let expiredCourses = sections
      .filter(
        section =>
          moment().diff(moment(section.updated)) >
          scheduleSectionLifetime.asMilliseconds()
      )
      .map(section => ({
        name: section.course_name,
        term: section.term
      }))
      .filter(
        (course, index, array) =>
          array.findIndex(
            e => e.name === course.name && e.term === course.term
          ) === index
      );
    expiredCourses.forEach(course => {
      console.log(course.name);
      this.setState(state => ({
        updatingCourse: state.updatingCourse.concat(course.name)
      }));
      axios
        .put(
          `/api/courses/${course.term}/${course.name}/`,
          {},
          {
            cancelToken: this.cancelSource.token
          }
        )
        .then(response => {
          this.setState(state => ({
            scheduleData: {
              ...state.scheduleData,
              sections: this.updateScheduleSections(
                state.scheduleData.sections,
                response.data
              )
            },
            updatingCourse: state.updatingCourse.filter(c => c !== course.name)
          }));
        })
        .catch(error => {
          this.setState(state => ({
            updatingCourse: state.updatingCourse.filter(c => c !== course.name)
          }));
        });
    });
  };

  updateScheduleSections = (sections, course) =>
    sections.map(section => {
      let updatedSection = course.sections.find(
        updatedSection =>
          updatedSection.id === section.id && course.term === section.term
      );
      if (updatedSection) {
        return { ...section, ...updatedSection, updated: course.updated };
      } else {
        return section;
      }
    });

  componentDidMount() {
    if (!this.state.scheduleData) {
      this.loadScheduleData();
    }
  }

  componentWillUnmount() {
    this.cancelSource.cancel(
      "axios requests cancelled on schedule page unmount"
    );
  }

  componentDidUpdate(prevProps) {
    if (Boolean(prevProps.tokens) !== Boolean(this.props.tokens)) {
      this.setState(
        { scheduleData: null, error: null },
        this.loadScheduleData()
      );
    }
  }

  render() {
    let { scheduleData, error, scheduleUser } = this.state;
    let schedule_name = getScheduleName(scheduleData, this.props.schedule_id);
    let message = error ? <Message error>{str2para(error)}</Message> : null;
    let content = null;
    let detail = null;

    if (scheduleData) {
      let canEdit =
        this.props.profile &&
        this.props.profile.id &&
        this.props.profile.id === scheduleData.user;
      let canAccessTask = canEdit || scheduleData.user === null;
      content = (
        <ScheduleWidget
          scheduleData={scheduleData}
          details
          topRightWidget={
            canAccessTask && (
              <RedirectButton
                button={{
                  content: "back to task",
                  size: "tiny",
                  compact: true,
                  fluid: true
                }}
                redirect={{ to: `/task/${scheduleData.task}/` }}
              />
            )
          }
          footerWidget={
            this.state.updatingCourse.length > 0 ? (
              <>
                Updating{" "}
                {this.state.updatingCourse
                  .map(course => course.toUpperCase())
                  .join(", ")}{" "}
                <Loader active inline size="tiny" />
              </>
            ) : null
          }
        />
      );
      detail = (
        <DetailWidget
          schedule={scheduleData}
          user={scheduleUser}
          canEdit={canEdit}
          onUpdate={data => this.setState({ scheduleData: data })}
          onDelete={() =>
            this.setState({
              error: "This schedule is deleted.",
              scheduleData: null
            })
          }
        />
      );
    } else if (!error) {
      content = (
        <Placeholder>
          <Placeholder.Header />
          <Placeholder.Line />
          <Placeholder.Line />
          <Placeholder.Header />
          <Placeholder.Line />
          <Placeholder.Line />
        </Placeholder>
      );
    }

    return (
      <Segment>
        <Header>{schedule_name}</Header>
        {detail}
        {message}
        {content}
      </Segment>
    );
  }
}

export default connect(state => ({
  tokens: state.user.tokens,
  profile: state.user.profile
}))(SchedulePage);

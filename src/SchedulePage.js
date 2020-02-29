import React from "react";
import {
  Placeholder,
  Segment,
  Message,
  Header,
  Item,
  Button,
  Grid,
  Icon,
  Modal,
  Form,
  Confirm,
  Loader
} from "semantic-ui-react";
import ScheduleWidget from "./ScheduleWidget";
import RedirectButton from "./RedirectButton";
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
} from "./util";
import { scheduleSectionLifetime } from "./settings";

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
      loading: false,
      openModal: null,
      editTitle: "",
      editDescription: "",
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

  handleUpdate = (e, { values }) => {
    if (this.props.schedule_id) {
      this.setState({ loading: true });
      axios
        .patch(`/api/schedules/${this.props.schedule_id}/`, values, {
          cancelToken: this.cancelSource.token
        })
        .then(response => {
          this.setState({
            scheduleData: response.data,
            loading: false,
            openModal: null,
            error: null
          });
        })
        .catch(error => {
          this.setState({
            error: errorFormatter(error),
            loading: false,
            openModal: null
          });
        });
    }
  };

  handleDelete = () => {
    if (this.props.schedule_id) {
      this.setState({ loading: true });
      axios
        .delete(`/api/schedules/${this.props.schedule_id}/`, {
          cancelToken: this.cancelSource.token
        })
        .then(response => {
          this.setState({
            scheduleData: response.data,
            loading: false,
            error: "This schedule has been deleted.",
            openModal: null
          });
        })
        .catch(error => {
          this.setState({
            error: errorFormatter(error),
            loading: false,
            openModal: null
          });
        });
    }
  };

  openEditModal = (e, { title, description }) => {
    this.setState({
      openModal: "edit",
      editTitle: title,
      editDescription: description
    });
  };

  openConfirmModal = () => {
    this.setState({
      openModal: "delete-confirm"
    });
  };

  closeModals = () => {
    this.setState({ openModal: null });
  };

  handleEditChange = (e, { name, value }) => {
    if (this.state.hasOwnProperty(name)) {
      this.setState({ [name]: value });
    }
  };

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
    let details = null;
    let editButtonGroup = null;
    if (scheduleData) {
      details = (
        <Item.Group>
          <Item>
            {scheduleUser && (
              <Item.Image
                size="tiny"
                src={scheduleUser.avatar}
                rounded
                className="schedule-user-avatar"
              />
            )}
            <Item.Content verticalAlign="middle">
              <Item.Description>
                Created {moment(scheduleData.created).fromNow()}
                {scheduleUser && `, by ${scheduleUser.display_name}`}.
              </Item.Description>
              <Item.Meta>
                {scheduleData.public ? "public" : "private"}
                {", "}
                {scheduleData.saved ? "saved" : "not saved"}
              </Item.Meta>
              <Item.Extra>{scheduleData.description}</Item.Extra>
            </Item.Content>
          </Item>
        </Item.Group>
      );

      let canEdit =
        this.props.profile &&
        this.props.profile.id &&
        this.props.profile.id === scheduleData.user;

      let canAccessTask = canEdit || scheduleData.user === null;

      if (canEdit) {
        let publishButton = null;
        let saveButton = null;
        let editButton = null;
        let deleteButton = null;
        let loadButton = null;
        if (scheduleData.public) {
          publishButton = (
            <Button
              className="schedule-button"
              color="green"
              disabled={this.state.loading}
              onClick={this.handleUpdate}
              values={{ public: false }}
            >
              public
            </Button>
          );
        } else {
          publishButton = (
            <Button
              className="schedule-button"
              disabled={this.state.loading}
              onClick={this.handleUpdate}
              values={{ public: true }}
            >
              private
            </Button>
          );
        }
        if (scheduleData.saved) {
          saveButton = (
            <Button
              className="schedule-button"
              color="blue"
              disabled={this.state.loading}
              onClick={this.handleUpdate}
              values={{ saved: false }}
            >
              saved
            </Button>
          );
        } else {
          saveButton = (
            <Button
              className="schedule-button"
              disabled={this.state.loading}
              onClick={this.handleUpdate}
              values={{ saved: true }}
            >
              not saved
            </Button>
          );
        }
        let charactersLeft = 200 - this.state.editDescription.length;
        let tooMany = charactersLeft < 0;
        editButton = (
          <Modal
            trigger={
              <Button icon className="schedule-button">
                <Icon name="pencil" /> edit
              </Button>
            }
            size="tiny"
            title={schedule_name}
            description={scheduleData.description}
            onOpen={this.openEditModal}
            onClose={this.closeModals}
            open={this.state.openModal === "edit"}
          >
            <Modal.Header>Edit Schedule</Modal.Header>
            <Modal.Content>
              <Form>
                <Form.Input
                  label="Title"
                  name="editTitle"
                  value={this.state.editTitle}
                  onChange={this.handleEditChange}
                />
                <Form.TextArea
                  label={`Description (${charactersLeft} characters left)`}
                  name="editDescription"
                  value={this.state.editDescription}
                  onChange={this.handleEditChange}
                  error={tooMany}
                />
              </Form>
            </Modal.Content>
            <Modal.Actions>
              <Button negative content="cancel" onClick={this.closeModals} />
              <Button
                positive
                content="save"
                values={{
                  name: this.state.editTitle,
                  description: this.state.editDescription
                }}
                loading={this.state.loading}
                disabled={this.state.loading || tooMany}
                onClick={this.handleUpdate}
              />
            </Modal.Actions>
          </Modal>
        );
        deleteButton = (
          <>
            <Button
              className="schedule-button"
              color="red"
              content="delete"
              onClick={this.openConfirmModal}
            />
            <Confirm
              open={this.state.openModal === "delete-confirm"}
              onCancel={this.closeModals}
              onConfirm={this.handleDelete}
              content="Are you sure you want to delete this schedule? You cannot undo this action."
              confirmButton={
                <Button
                  primary={false}
                  color="red"
                  content="Delete"
                  onClick={this.openConfirmModal}
                  loading={this.state.loading}
                  disabled={this.state.loading}
                />
              }
            />
          </>
        );
        loadButton = <Button content="load" className="schedule-button" />;
        editButtonGroup = (
          <>
            {editButton}
            {saveButton}
            {publishButton}
            {deleteButton}
            {loadButton}
          </>
        );
      }

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
        {details !== null && (
          <Grid stackable verticalAlign="middle" style={{ marginBottom: 0 }}>
            <Grid.Column width={8}>{details}</Grid.Column>
            <Grid.Column width={8}>{editButtonGroup}</Grid.Column>
          </Grid>
        )}
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

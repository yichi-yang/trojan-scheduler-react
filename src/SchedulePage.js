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
  Form
} from "semantic-ui-react";
import ScheduleWidget from "./ScheduleWidget";
import moment from "moment";
import { connect } from "react-redux";
import axios from "axios";
import jwtDecode from "jwt-decode";
import {
  errorFormatterCreator,
  responseDataFormatter,
  statusCodeFormatter,
  noPermissionFormatter,
  str2para,
  getScheduleName
} from "./util";

const CancelToken = axios.CancelToken;
const source = CancelToken.source();

const errorFormatter = errorFormatterCreator(
  noPermissionFormatter("You cannot view this schedule because it is private."),
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
      editModalOpen: false,
      editTitle: "",
      editDescription: ""
    };
    if (!props.schedule_id) {
      this.state.error = "no schedule id in props";
    }
  }

  loadScheduleData = () => {
    if (this.props.schedule_id) {
      console.log("load");
      axios
        .get(`/api/schedules/${this.props.schedule_id}/`, {
          cancelToken: source.token
        })
        .then(response => {
          let { data } = response;
          this.setStateAsync({ scheduleData: data });
          if (data.user) {
            axios
              .get(`/api/users/${data.user}/`, {
                cancelToken: source.token
              })
              .then(response =>
                this.setStateAsync({ scheduleUser: response.data })
              );
          } else {
            this.setStateAsync({
              scheduleUser: {
                avatar: "https://avatars.dicebear.com/v2/bottts/Empty.svg",
                display_name: "Anonymous"
              }
            });
          }
        })
        .catch(error => {
          this.setStateAsync({
            error: errorFormatter(error)
          });
        });
    }
  };

  handleUpdate = (e, { values }) => {
    if (this.props.schedule_id) {
      axios
        .patch(`/api/schedules/${this.props.schedule_id}/`, values)
        .then(response => {
          this.setStateAsync({
            scheduleData: response.data,
            loading: false,
            editModalOpen: false,
            error: null
          });
        })
        .catch(error => {
          this.setStateAsync({
            error: errorFormatter(error),
            loading: false,
            editModalOpen: false
          });
        });
    }
  };

  openEditModal = (e, { title, description }) => {
    this.setState({
      editModalOpen: true,
      editTitle: title,
      editDescription: description
    });
  };

  closeEditModal = () => {
    this.setState({ editModalOpen: false });
  };

  handleEditChange = (e, { name, value }) => {
    if (this.state.hasOwnProperty(name)) {
      this.setState({ [name]: value });
    }
  };

  setStateAsync = (arg, callback) => {
    if (this._mounted) {
      this.setState(arg, callback);
    }
  };

  componentDidMount() {
    this._mounted = true;
    if (!this.state.scheduleData) {
      this.loadScheduleData();
    }
    this.isLoggedIn = Boolean(this.props.tokens);
  }

  componentWillUnmount() {
    this._mounted = false;
    source.cancel("axios requests cancelled on unmount");
  }

  componentDidUpdate() {
    let isLoggedIn = Boolean(this.props.tokens);
    if (isLoggedIn !== this.isLoggedIn) {
      console.log("state change");
      this.isLoggedIn = isLoggedIn;
      this.setState({ scheduleData: null, error: null });
      this.loadScheduleData();
    }
  }

  render() {
    let { scheduleData, error, scheduleUser } = this.state;
    let schedule_name = getScheduleName(scheduleData, this.props.schedule_id);
    let message = error ? <Message error>{str2para(error)}</Message> : null;
    let content = null;
    let details = null;
    let setPublicButton = null;
    let saveUnsaveButton = null;
    let editButton = null;
    if (scheduleData) {
      content = <ScheduleWidget scheduleData={scheduleData} />;

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

      if (this.props.tokens && this.props.tokens.access) {
        let { user_id } = jwtDecode(this.props.tokens.access);
        if (user_id === scheduleData.user)
          if (scheduleData.public) {
            setPublicButton = (
              <Button
                secondary
                loading={this.state.loading}
                disabled={this.state.loading}
                value={false}
                onClick={this.handleUpdate}
                values={{ public: false }}
              >
                unpublish
              </Button>
            );
          } else {
            setPublicButton = (
              <Button
                primary
                loading={this.state.loading}
                disabled={this.state.loading}
                value={true}
                onClick={this.handleUpdate}
                values={{ public: true, saved: true }}
              >
                publish
              </Button>
            );
          }
        if (scheduleData.saved) {
          saveUnsaveButton = (
            <Button
              secondary
              loading={this.state.loading}
              disabled={this.state.loading}
              value={false}
              onClick={this.handleUpdate}
              values={{ public: false, saved: false }}
            >
              undo save
            </Button>
          );
        } else {
          saveUnsaveButton = (
            <Button
              primary
              loading={this.state.loading}
              disabled={this.state.loading}
              value={true}
              onClick={this.handleUpdate}
              values={{ saved: true }}
            >
              save
            </Button>
          );
        }
        let charactersLeft = 200 - this.state.editDescription.length;
        let tooMany = charactersLeft < 0;
        editButton = (
          <Modal
            trigger={
              <Button icon>
                <Icon name="pencil" />
              </Button>
            }
            size="tiny"
            title={schedule_name}
            description={scheduleData.description}
            onOpen={this.openEditModal}
            onClose={this.closeEditModal}
            open={this.state.editModalOpen}
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
              <Button negative content="cancel" onClick={this.closeEditModal} />
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
      }
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
            <Grid.Column width={8}>
              {editButton}
              {saveUnsaveButton}
              {setPublicButton}
            </Grid.Column>
          </Grid>
        )}
        {message}
        {content}
      </Segment>
    );
  }
}

export default connect(state => ({
  tokens: state.user.tokens
}))(SchedulePage);

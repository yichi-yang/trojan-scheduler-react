import React from "react";
import {
  Placeholder,
  Segment,
  Message,
  Header,
  Item,
  Button,
  Grid
} from "semantic-ui-react";
import ScheduleWidget from "./ScheduleWidget";
import moment from "moment";
import { connect } from "react-redux";
import { getScheduleName, error2message } from "./util";
import axios from "axios";
import jwtDecode from "jwt-decode";

class SchedulePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scheduleData: null,
      scheduleUser: null,
      error: null,
      loadingSetPublicResult: false
    };
    if (!props.schedule_id) {
      this.state.error = "no schedule id in props";
    }
  }

  loadScheduleData = () => {
    if (this.props.schedule_id) {
      console.log("load");
      axios
        .get(`/api/schedules/${this.props.schedule_id}/`)
        .then(response => {
          let { data } = response;
          this.setStateAsync({ scheduleData: data });
          if (data.user) {
            axios
              .get(`/api/users/${data.user}/`)
              .then(response =>
                this.setStateAsync({ scheduleUser: response.data })
              );
          }
        })
        .catch(error => {
          this.setStateAsync({
            error: error2message(
              error,
              "You cannot view this schedule because it is private."
            )
          });
        });
    }
  };

  setPublic = (e, { value }) => {
    if (this.props.schedule_id) {
      axios
        .patch(`/api/schedules/${this.props.schedule_id}/`, { public: value })
        .then(response => {
          this.setStateAsync({
            scheduleData: response.data,
            loadingSetPublicResult: false
          });
        })
        .catch(error => {
          this.setStateAsync({
            error: error2message(error),
            loadingSetPublicResult: false
          });
        });
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
    let message = error ? <Message error>{error}</Message> : null;
    let content = null;
    let details = null;
    let description = null;
    let setPublicButton = null;
    if (scheduleData) {
      content = (
        <>
          <ScheduleWidget scheduleData={scheduleData} />
        </>
      );

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
              <Item.Extra>
                {scheduleData.public ? "public" : "private"}
                {", "}
                {scheduleData.saved ? "saved" : "not saved"}
              </Item.Extra>
            </Item.Content>
          </Item>
        </Item.Group>
      );

      if (scheduleData.description) {
        description = (
          <p style={{ color: "gray" }}>{scheduleData.description}</p>
        );
      }

      if (this.props.tokens && this.props.tokens.access) {
        let { user_id } = jwtDecode(this.props.tokens.access);
        if (user_id === scheduleData.user)
          if (scheduleData.public) {
            setPublicButton = (
              <Button
                secondary
                loading={this.state.loadingSetPublicResult}
                value={false}
                onClick={this.setPublic}
              >
                unpublish
              </Button>
            );
          } else {
            setPublicButton = (
              <Button
                primary
                loading={this.state.loadingSetPublicResult}
                value={true}
                onClick={this.setPublic}
              >
                publish
              </Button>
            );
          }
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
            <Grid.Column width={8}>{setPublicButton}</Grid.Column>
          </Grid>
        )}
        {description}
        {message}
        {content}
      </Segment>
    );
  }
}

export default connect(state => ({
  tokens: state.user.tokens
}))(SchedulePage);

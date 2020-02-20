import React from "react";
import {
  Placeholder,
  Segment,
  Message,
  Header,
  Item,
  Divider,
  Button,
  Grid
} from "semantic-ui-react";
import ScheduleWidget from "./ScheduleWidget";
import moment from "moment";
import { connect } from "react-redux";
import { getScheduleName } from "./util";

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
      let fetchOptions = {
        method: "GET",
        headers: { Accept: "application/json" }
      };
      if (this.props.tokens && this.props.tokens.access) {
        fetchOptions.headers[
          "Authorization"
        ] = `Bearer ${this.props.tokens.access}`;
      }
      fetch(`/api/schedules/${this.props.schedule_id}/`, fetchOptions)
        .then(response => {
          if (response.ok) {
            return response.json();
          } else if ([401, 403].includes(response.status)) {
            throw new Error(
              "You cannot view this schedule because it is private."
            );
          }
          throw new Error(
            `task-${this.props.schedule_id} ${response.status} ${response.statusText}`
          );
        })
        .then(data => {
          this.setStateAsync({ scheduleData: data });
          if (data.user) {
            fetch(`/api/users/${data.user}/`, fetchOptions)
              .then(response => {
                if (response.ok) {
                  return response.json();
                }
                throw new Error(
                  `user-${data.user} ${response.status} ${response.statusText}`
                );
              })
              .then(scheduleUser => this.setStateAsync({ scheduleUser }));
          }
        })
        .catch(error => {
          this.setStateAsync({ error: error.message });
        });
    }
  };

  setPublic = (e, { value }) => {
    if (this.props.schedule_id) {
      let fetchOptions = {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ public: value })
      };
      if (this.props.tokens && this.props.tokens.access) {
        fetchOptions.headers[
          "Authorization"
        ] = `Bearer ${this.props.tokens.access}`;
      }
      this.setStateAsync({ loadingSetPublicResult: true });
      fetch(`/api/schedules/${this.props.schedule_id}/`, fetchOptions)
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error(
            `Cannot change public setting. ${response.status} ${response.statusText}`
          );
        })
        .then(data => {
          this.setStateAsync({
            scheduleData: data,
            loadingSetPublicResult: false
          });
        })
        .catch(error => {
          this.setStateAsync({
            error: error.message,
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

      let { currentUser } = this.props;
      if (currentUser && scheduleData.user === currentUser.id) {
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
        <Grid stackable verticalAlign="middle" style={{ marginBottom: 0 }}>
          <Grid.Column width={8}>{details}</Grid.Column>
          <Grid.Column width={8}>{setPublicButton}</Grid.Column>
        </Grid>

        {description}

        {message}
        {content}
      </Segment>
    );
  }
}

export default connect(state => ({
  tokens: state.user.tokens,
  currentUser: state.user.profile
}))(SchedulePage);

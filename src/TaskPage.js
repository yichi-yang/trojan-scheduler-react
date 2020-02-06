import React from "react";
import {
  Placeholder,
  Segment,
  Accordion,
  Message,
  Icon,
  Header
} from "semantic-ui-react";
import ScheduleWidget from "./ScheduleWidget";
import moment from "moment";
import { connect } from "react-redux";

class TaskPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    if (props.task_data) {
      this.state.task_data = props.task_data;
    } else if (
      props.location &&
      props.location.state &&
      props.location.state.task_data
    ) {
      this.state.task_data = props.location.state.task_data;
    } else if (!props.task_id) {
      this.state.error = "no task id in props";
    }
  }

  weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  handleSelect(id) {
    this.setState(state => {
      if (state.selected === id) {
        return { selected: null };
      } else {
        return { selected: id };
      }
    });
  }

  loadTaskData = () => {
    if (this.props.task_id) {
      let fetchOptions = {
        method: "GET",
        headers: { Accept: "application/json" }
      };
      if (this.props.tokens && this.props.tokens.access) {
        fetchOptions.headers[
          "Authorization"
        ] = `Bearer ${this.props.tokens.access}`;
      }
      fetch(`/api/tasks/${this.props.task_id}/`, fetchOptions)
        .then(response => {
          if (response.ok) {
            return response.json();
          } else if ([401, 403].includes(response.status)) {
            throw new Error("You cannot view this task because it is private.");
          }
          throw new Error(
            `task-${this.props.task_id} ${response.status} ${response.statusText}`
          );
        })
        .then(data => {
          this.setState({ task_data: data });
        })
        .catch(error => {
          this.setState({ error: error.message });
        });
    }
  };

  componentDidMount() {
    if (!this.state.task_data) {
      this.loadTaskData();
    }
    this.isLoggedIn = Boolean(this.props.tokens);
  }

  componentDidUpdate() {
    let isLoggedIn = Boolean(this.props.tokens);
    if (isLoggedIn !== this.isLoggedIn) {
      this.isLoggedIn = isLoggedIn;
      this.setState({ task_data: null, error: null });
      this.loadTaskData();
    }
  }

  render() {
    let { task_data, error, selected } = this.state;
    let task_name = null;
    if (task_data) {
      if (task_data.name) {
        task_name = task_data.name;
      } else {
        task_name = "Task " + task_data.id;
      }
    } else {
      task_name = "Task " + this.props.task_id;
    }
    let message = null;
    if (error) {
      message = <Message error>{error}</Message>;
    } else if (task_data) {
      switch (task_data.status) {
        case "PD":
          message = <Message>Pending...</Message>;
          break;
        case "PS":
          message = <Message>Processing...</Message>;
          break;
        case "WN":
          message = <Message warning>{task_data.message}</Message>;
          break;
        case "FL":
          message = <Message error>{task_data.message}</Message>;
          break;
        case "EX":
          message = (
            <Message error>
              Sorry, we encountered an issue generating schedules for you, send
              us a message with this error code: {task_data.message}.
            </Message>
          );
          break;
        default:
          break;
      }
    }
    let content = null;
    let details = null;
    if (task_data) {
      if (task_data.schedules.length !== 0) {
        content = (
          <>
            <Accordion styled fluid>
              {[...task_data.schedules]
                .sort((a, b) => a.id - b.id)
                .map(schedule => (
                  <React.Fragment key={schedule.id}>
                    <Accordion.Title
                      active={this.state.selected === schedule.id}
                      onClick={() => this.handleSelect(schedule.id)}
                    >
                      <Icon name="dropdown" />
                      {schedule.name
                        ? schedule.name
                        : "Schedule " + schedule.id}
                    </Accordion.Title>
                    {selected === schedule.id && (
                      <Accordion.Content active>
                        <ScheduleWidget schedule_data={schedule} />
                      </Accordion.Content>
                    )}
                  </React.Fragment>
                ))}
            </Accordion>
          </>
        );
      }
      if (task_data.status === "DN" || task_data.schedules.length > 0) {
        details = (
          <p style={{ color: "gray" }}>
            Created {moment(task_data.created).fromNow()}
            {", "}
            {task_data.count} valid schedules found.
          </p>
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
        {" "}
        <Header>{task_name}</Header>
        {details}
        {message}
        {content}
      </Segment>
    );
  }
}

export default connect(state => ({
  tokens: state.user.tokens
}))(TaskPage);

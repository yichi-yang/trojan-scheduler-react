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
import RedirectButton from "../RedirectButton";
import moment from "moment";
import { connect } from "react-redux";
import axios from "axios";
import { error2message } from "../../util";

class TaskPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    if (props.taskData) {
      this.state.taskData = props.taskData;
    } else if (
      props.location &&
      props.location.state &&
      props.location.state.taskData
    ) {
      this.state.taskData = props.location.state.taskData;
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
    console.log("load task");
    if (this.props.task_id) {
      axios
        .get(`/api/tasks/${this.props.task_id}/`)
        .then(response => {
          this.setState({ taskData: response.data });
        })
        .catch(error => {
          this.setState({ error: error2message(error) });
        });
    }
  };

  componentDidMount() {
    if (!this.state.taskData) {
      this.loadTaskData();
    }
  }

  componentDidUpdate(prevProps) {
    if (Boolean(prevProps.tokens) !== Boolean(this.props.tokens)) {
      this.setState({ taskData: null, error: null });
      this.loadTaskData();
    }
  }

  render() {
    let { taskData, error, selected } = this.state;
    let task_name = null;
    if (taskData) {
      if (taskData.name) {
        task_name = taskData.name;
      } else {
        task_name = "Task " + taskData.id;
      }
    } else {
      task_name = "Task " + this.props.task_id;
    }
    let message = null;
    if (error) {
      message = <Message error>{error}</Message>;
    } else if (taskData) {
      switch (taskData.status) {
        case "PD":
          message = <Message>Pending...</Message>;
          break;
        case "PS":
          message = <Message>Processing...</Message>;
          break;
        case "WN":
          message = <Message warning>{taskData.message}</Message>;
          break;
        case "FL":
          message = <Message error>{taskData.message}</Message>;
          break;
        case "EX":
          message = (
            <Message error>
              Sorry, we encountered an issue generating schedules for you, send
              us a message with this error code: {taskData.message}.
            </Message>
          );
          break;
        default:
          break;
      }
    }
    let content = null;
    let details = null;
    let description = null;
    if (taskData) {
      if (taskData.schedules.length !== 0) {
        content = (
          <>
            <Accordion styled fluid>
              {[...taskData.schedules]
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
                        <ScheduleWidget
                          scheduleData={schedule}
                          topRightWidget={
                            <RedirectButton
                              button={{
                                content: "more details",
                                size: "tiny",
                                compact: true,
                                fluid: true
                              }}
                              redirect={{ to: `/schedule/${schedule.id}/` }}
                            />
                          }
                        />
                      </Accordion.Content>
                    )}
                  </React.Fragment>
                ))}
            </Accordion>
          </>
        );
      }
      if (taskData.status === "DN" || taskData.schedules.length > 0) {
        details = (
          <p style={{ color: "gray" }}>
            Created {moment(taskData.created).fromNow()}
            {", "}
            {taskData.count} valid schedules found.
          </p>
        );
      }
      if (taskData.description) {
        description = <p style={{ color: "gray" }}>{taskData.description}</p>;
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
        {description}
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

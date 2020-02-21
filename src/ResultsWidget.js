import React from "react";
import {
  Container,
  Form,
  Segment,
  Button,
  Message,
  List
} from "semantic-ui-react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { saveTaskResult } from "./actions";
import axios from "axios";

class ResultsWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = { taskName: "" };
  }

  handleSend = () => {
    this.props.saveTaskResult(null);
    this.setState({ error: null, loading: true });
    axios
      .post("/api/tasks/", {
        coursebin: this.props.coursebin,
        preference: this.props.preference,
        name: this.state.taskName
      })
      .then(response => {
        let { data } = response;
        this.props.saveTaskResult(data);
        if (data.status === "PD" || data.status === "PS") {
          this.pollTask(data.id, 10, 500);
        }
      })
      .catch(error => {
        this.setState({ error: error.message, loading: false });
      });
  };

  handleTaskNameChange = (e, { value }) => {
    this.setState({ taskName: value });
  };

  pollTask = (id, ttl, delay) => {
    axios
      .get(`/api/tasks/${id}/`)
      .then(response => {
        let { data } = response;
        this.props.saveTaskResult(data);
        if (data.status === "PD" || data.status === "PS") {
          this.pollTask(data.id, null, 500);
          if (ttl !== null && ttl <= 0) {
            this.setState({ error: "Timeout" });
          } else {
            setTimeout(
              this.pollTask,
              delay,
              id,
              ttl === null ? null : ttl - 1,
              Math.min(delay * 2, 60000)
            );
          }
        } else {
          this.setState({ loading: false });
        }
      })
      .catch(error => {
        this.setState({ error: error.message, loading: false });
      });
  };

  render() {
    let { error, loading } = this.state;
    let { result } = this.props;
    let content = null;
    let button = null;
    if (error) {
      content = (
        <Segment>
          <Message error>{error}</Message>
        </Segment>
      );
    } else if (result) {
      let message = null;
      switch (result.status) {
        case "PD":
          message = <Message>Pending...</Message>;
          break;
        case "PS":
          message = <Message>Processing...</Message>;
          break;
        case "DN":
          message = (
            <Message success>
              Done! We found {result.count} valid schedules and we picked the
              top {result.schedules.length} for you.
            </Message>
          );
          break;
        case "WN":
          message = <Message warning>{result.message}</Message>;
          break;
        case "FL":
          message = <Message error>{result.message}</Message>;
          break;
        case "EX":
          message = (
            <Message error>
              Sorry, we encountered an issue generating schedules for you, send
              us a message with this error code: {result.message}.
            </Message>
          );
          break;
        default:
          break;
      }

      if (this.state.redirect) {
        button = (
          <Redirect
            to={{ pathname: this.state.redirect, state: { task_data: result } }}
          />
        );
      } else if (result.status === "DN" || result.status === "WN") {
        button = (
          <Button
            onClick={() => this.setState({ redirect: `/task/${result.id}/` })}
            type="submit"
          >
            Results
          </Button>
        );
      }

      content = (
        <Segment>
          {message}
          {button}
        </Segment>
      );
    }

    let coursebinSummary = null;
    if (this.props.coursebin.length === 0) {
      coursebinSummary = <Message info>Your coursebin is empty.</Message>;
    } else {
      coursebinSummary = (
        <Message info>
          You have{" "}
          {this.props.coursebin.filter(node => node.type === "course").length}{" "}
          course(s) in your coursebin.
          <List bulleted>
            {this.props.coursebin
              .filter(node => node.type === "course")
              .map(node => (
                <List.Item key={node.key}>{node.course}</List.Item>
              ))}
          </List>
        </Message>
      );
    }
    return (
      <Container>
        <Segment.Group>
          <Segment>
            {coursebinSummary}
            <Form>
              <Form.Group>
                <Form.Input
                  placeholder="Name your task"
                  value={this.state.taskName}
                  onChange={this.handleTaskNameChange}
                  width={13}
                />
                <Form.Button
                  onClick={this.handleSend}
                  loading={loading}
                  disabled={loading || this.props.coursebin.length === 0}
                  width={3}
                  fluid
                >
                  send
                </Form.Button>
              </Form.Group>
            </Form>
          </Segment>
          {content}
        </Segment.Group>
      </Container>
    );
  }
}

export default connect(
  state => ({
    coursebin: state.course,
    preference: state.preference,
    result: state.task_result,
    tokens: state.user.tokens
  }),
  { saveTaskResult }
)(ResultsWidget);

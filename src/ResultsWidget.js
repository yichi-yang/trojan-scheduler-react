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

class ResultsWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleSend = () => {
    this.props.saveTaskResult(null);
    this.setState({ error: null, loading: true });
    let fetchOptions = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        coursebin: this.props.coursebin,
        preference: this.props.preference
      })
    };
    if (this.props.tokens && this.props.tokens.access) {
      fetchOptions.headers[
        "Authorization"
      ] = `Bearer ${this.props.tokens.access}`;
    }
    fetch(`/api/tasks/`, fetchOptions)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(`${response.status} ${response.statusText}`);
      })
      .then(data => {
        this.props.saveTaskResult(data);
        if (data.status === "PD" || data.status === "PS") {
          this.pollTask(data.id, 5, 500);
        }
      })
      .catch(error => {
        this.setState({ error: error.message, loading: false });
      });
  };

  pollTask(id, ttl, delay) {
    let fetchOptions = {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    };
    if (this.props.tokens && this.props.tokens.access) {
      fetchOptions.headers[
        "Authorization"
      ] = `Bearer ${this.props.tokens.access}`;
    }
    fetch(`/api/tasks/${id}/`, fetchOptions)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(`${response.status} ${response.statusText}`);
      })
      .then(data => {
        if (!data.status) {
          throw new Error("Invalid response");
        }
        if (data.status === "PD" || data.status === "PS") {
          this.props.saveTaskResult(data);
          if (ttl <= 0) {
            this.setState({ error: "Timeout" });
          } else {
            setTimeout(this.pollTask.bind(this), delay, id, ttl - 1, delay * 2);
          }
        } else {
          this.props.saveTaskResult(data);
          this.setState({ loading: false });
        }
      })
      .catch(error => {
        this.setState({ error: error.message, loading: false });
      });
  }

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
              <Form.Field
                control={Button}
                onClick={this.handleSend}
                loading={loading}
                disabled={loading || this.props.coursebin.length === 0}
              >
                send
              </Form.Field>
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

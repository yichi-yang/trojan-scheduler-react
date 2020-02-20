import React from "react";
import {
  Placeholder,
  Segment,
  Message,
  Item,
  Pagination
} from "semantic-ui-react";
import moment from "moment";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

class TaskListPage extends React.Component {
  constructor(props) {
    super(props);
    let page = 1;
    if (this.props.location && this.props.location.search) {
      let params = new URLSearchParams(this.props.location.search);
      page = params.get("page");
    }
    this.state = { task_list: null, error: null, loading: false, page };
  }

  loadTaskData = () => {
    let fetchOptions = {
      method: "GET",
      headers: { Accept: "application/json" }
    };
    if (this.props.tokens && this.props.tokens.access) {
      fetchOptions.headers[
        "Authorization"
      ] = `Bearer ${this.props.tokens.access}`;
    }
    this.setState({ loading: true, task_list: null, error: null });
    fetch(`/api/tasks/?page=${this.state.page}`, fetchOptions)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        // else if ([401, 403].includes(response.status)) {
        //   throw new Error("You cannot view this task because it is private.");
        // }
        throw new Error(`${response.status} ${response.statusText}`);
      })
      .then(data => {
        this.setState({ task_list: data, loading: false });
      })
      .catch(error => {
        this.setState({ error: error.message, loading: false });
      });
  };

  componentDidMount() {
    if (!this.state.task_list) {
      this.loadTaskData();
    }
    this.isLoggedIn = Boolean(this.props.tokens);
  }

  componentDidUpdate() {
    let page = 1;
    if (this.props.location && this.props.location.search) {
      let params = new URLSearchParams(this.props.location.search);
      page = params.get("page");
    }
    if (this.state.page !== page) {
      this.setState({ page }, this.loadTaskData);
    }
    let isLoggedIn = Boolean(this.props.tokens);
    if (isLoggedIn !== this.isLoggedIn) {
      this.isLoggedIn = isLoggedIn;
      this.loadTaskData();
    }
  }

  taskMeta = ({ status, message }) => {
    if (status === "PD") {
      return "Pending...";
    } else if (status === "PS") {
      return "Processing...";
    } else if (status === "DN") {
      return "Done.";
    } else if (status === "WN") {
      return `Warning: ${message}`;
    } else if (status === "ER") {
      return `Error: ${message}`;
    } else if (status === "EX") {
      return `Oops... Task failed with exception ${message}.`;
    } else {
      return "???";
    }
  };

  handlePaginationChange = (e, { activePage }) => {
    let query = new URLSearchParams();
    query.set("page", activePage);
    this.props.history.push(
      this.props.location.pathname + "?" + query.toString()
    );
  };

  render() {
    let { task_list, error, loading } = this.state;
    let message = null;
    if (error) {
      message = <Message error>{error}</Message>;
    } else if (task_list && task_list.detail) {
      message = <Message error>{task_list.detail}</Message>;
    }

    let content = null;
    let pagination = null;
    if (!loading && task_list && task_list.results) {
      content = (
        <Item.Group divided>
          {task_list.results.map(task => (
            <Item key={task.id}>
              <Item.Content>
                <Item.Header as={Link} to={task.id + "/"}>
                  {task.name ? task.name : `Task ${task.id}`}
                </Item.Header>
                <Item.Meta>{this.taskMeta(task)}</Item.Meta>
                <Item.Extra>
                  {task.count} schedules, created{" "}
                  {moment(task.created).fromNow()}
                </Item.Extra>
              </Item.Content>
            </Item>
          ))}
        </Item.Group>
      );
      pagination = (
        <Pagination
          activePage={this.state.page}
          onPageChange={this.handlePaginationChange}
          totalPages={task_list.total_pages}
        />
      );
    }

    let placeholder = null;
    if (loading) {
      placeholder = (
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
      <>
        <Segment>
          {/* <Header>Tasks</Header> */}
          {message}
          {placeholder}
          {content}
        </Segment>
        {pagination}
      </>
    );
  }
}

export default connect(state => ({
  tokens: state.user.tokens
}))(TaskListPage);

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

class ScheduleListPage extends React.Component {
  constructor(props) {
    super(props);
    let page = 1;
    if (this.props.location && this.props.location.search) {
      let params = new URLSearchParams(this.props.location.search);
      page = params.get("page");
    }
    this.state = { schedule_list: null, error: null, loading: false, page };
  }

  loadScheduleData = () => {
    let fetchOptions = {
      method: "GET",
      headers: { Accept: "application/json" }
    };
    if (this.props.tokens && this.props.tokens.access) {
      fetchOptions.headers[
        "Authorization"
      ] = `Bearer ${this.props.tokens.access}`;
    }
    this.setState({ loading: true, schedule_list: null, error: null });
    fetch(`/api/schedules/?page=${this.state.page}`, fetchOptions)
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
        this.setState({ schedule_list: data, loading: false });
      })
      .catch(error => {
        this.setState({ error: error.message, loading: false });
      });
  };

  componentDidMount() {
    if (!this.state.schedule_list) {
      this.loadScheduleData();
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
      this.setState({ page }, this.loadScheduleData);
    }
    let isLoggedIn = Boolean(this.props.tokens);
    if (isLoggedIn !== this.isLoggedIn) {
      this.isLoggedIn = isLoggedIn;
      this.loadScheduleData();
    }
  }

  scheduleMeta = schedule => {
    let meta = schedule.public ? "Public" : "Private";
    if (!schedule.user) {
      meta += " (created by anonymous user)";
    }
    return meta;
  };

  handlePaginationChange = (e, { activePage }) => {
    let query = new URLSearchParams();
    query.set("page", activePage);
    this.props.history.push(
      this.props.location.pathname + "?" + query.toString()
    );
  };

  render() {
    let { schedule_list, error, loading } = this.state;
    let message = null;
    if (error) {
      message = <Message error>{error}</Message>;
    } else if (schedule_list && schedule_list.detail) {
      message = <Message error>{schedule_list.detail}</Message>;
    }

    let content = null;
    let pagination = null;
    if (!loading && schedule_list && schedule_list.results) {
      if (schedule_list.results.length === 0) {
        content = <Message info>You haven't saved any schedules.</Message>;
      } else {
        content = (
          <Item.Group divided>
            {schedule_list.results.map(schedule => (
              <Item key={schedule.id}>
                <Item.Content>
                  <Item.Header as={Link} to={schedule.id + "/"}>
                    {schedule.name ? schedule.name : `Schedule ${schedule.id}`}
                  </Item.Header>
                  <Item.Meta>{this.scheduleMeta(schedule)}</Item.Meta>
                  <Item.Extra>
                    Total cost {schedule.total_score}, created{" "}
                    {moment(schedule.created).fromNow()}
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
            totalPages={schedule_list.total_pages}
          />
        );
      }
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
}))(ScheduleListPage);

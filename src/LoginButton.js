import React from "react";
import {
  Button,
  Message,
  Modal,
  Form,
  Segment,
  Image,
  Dimmer,
  Loader,
  Placeholder,
  Dropdown
} from "semantic-ui-react";
import { connect } from "react-redux";
import { setUserTokens, setUserProfile, clearUserState } from "./actions";
import jwtDecode from "jwt-decode";

class LoginButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      loginError: "",
      refreshing: false,
      modalOpen: false
    };
  }

  handleStateChange = (event, { name, value }) => {
    if (this.state.hasOwnProperty(name)) {
      this.setState({ [name]: value });
    }
  };

  login = () => {
    let { username, password } = this.state;
    let { setUserTokens, clearUserState } = this.props;
    fetch("/api/token/", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.refresh && data.access) {
          setUserTokens(data);
          this.setRefreshTokenTimer(data.access);
          this.getProfile(data.access);
          this.setState({ loginError: "", modalOpen: false });
        } else if (data.detail) {
          throw new Error(data.detail);
        } else {
          throw new Error(
            Object.entries(data)
              .map(
                ([key, value]) =>
                  key + ": " + (Array.isArray(value) ? value.join() : value)
              )
              .join("\n")
          );
        }
      })
      .catch(error => {
        console.log(error.message);
        this.setState({ loginError: error.message, modalOpen: true });
        clearUserState();
      });
  };

  setRefreshTokenTimer = access => {
    let { exp } = jwtDecode(access);
    let msToExpiration = exp * 1000 - new Date().getTime();
    this.timeoutID = setTimeout(
      this.refreshToken,
      Math.max(msToExpiration - 30000, 0)
    );
    console.log("refresh after " + Math.max(msToExpiration - 30000, 0) / 1000);
  };

  refreshToken = () => {
    let { setUserTokens, clearUserState } = this.props;
    let { refresh } = this.props.user.tokens;
    console.log("refresh");
    if (refresh) {
      setUserTokens({ refresh });
      this.setState({ refreshing: true });
      fetch("/api/token/refresh/", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ refresh })
      })
        .then(response => {
          if (response.ok) {
            return response.json();
          } else if ([401, 403].includes(response.status)) {
            throw new Error("Your session has expired. Sign in to continue.");
          } else {
            throw new Error(`${response.status} ${response.statusText}`);
          }
        })
        .then(data => {
          setUserTokens({ refresh, ...data });
          this.setState({ refreshing: false });
          this.setRefreshTokenTimer(data.access);
        })
        .catch(error => {
          clearUserState();
          this.setState({
            loginError: error.message,
            refreshing: false,
            modalOpen: true
          });
        });
    }
  };

  getProfile = access => {
    let { setUserProfile, clearUserState } = this.props;
    let { user_id } = jwtDecode(access);
    fetch(`/api/users/${user_id}/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${access}`
      }
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else if ([401, 403].includes(response.status)) {
          throw new Error("Your session has expired. Sign in to continue.");
        } else {
          throw new Error(`${response.status} ${response.statusText}`);
        }
      })
      .then(data => {
        setUserProfile(data);
      })
      .catch(error => {
        clearUserState();
        this.setState({ loginError: error.message, modalOpen: true });
      });
  };

  handleOpen = () => this.setState({ modalOpen: true });

  handleClose = () => this.setState({ modalOpen: false });

  componentDidMount() {
    let { tokens } = this.props.user;
    if (tokens && tokens.access) {
      this.setRefreshTokenTimer(tokens.access);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutID);
  }

  handleMenuSelect = (e, { value }) => {
    if (value === "sign-out") {
      this.props.clearUserState();
    }
  };

  render() {
    let button = null;
    let { loginError } = this.state;
    if (!this.props.user.tokens) {
      button = (
        <Modal
          trigger={
            <Button onClick={this.handleOpen} primary>
              Sign In
            </Button>
          }
          size="tiny"
          onClose={this.handleClose}
          open={this.state.modalOpen}
        >
          <Modal.Header>Sign In</Modal.Header>
          <Form error={!!loginError} size="large">
            <Segment stacked>
              <Message error>
                {loginError.split("\n").map(line => (
                  <p key={line}>{line}</p>
                ))}
              </Message>
              <Form.Input
                fluid
                icon="user"
                iconPosition="left"
                placeholder="Username"
                name="username"
                onChange={(e, props) => this.handleStateChange(e, props)}
              />
              <Form.Input
                fluid
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                type="password"
                name="password"
                onChange={(e, props) => this.handleStateChange(e, props)}
              />

              <Button color="teal" fluid size="large" onClick={this.login}>
                Login
              </Button>
            </Segment>
          </Form>
        </Modal>
      );
    } else {
      let { profile } = this.props.user;
      let avatar = null;
      let placeholder = null;
      if (profile && profile.avatar) {
        avatar = profile.avatar;
      } else {
        placeholder = (
          <Placeholder inverted>
            <Placeholder.Image square />
          </Placeholder>
        );
      }
      let avatarWidget = (
        <Dimmer.Dimmable as="div" dimmed={this.state.refreshing}>
          <Image src={avatar} size="mini" rounded>
            {placeholder}
          </Image>
          <Dimmer active={this.state.refreshing}>
            <Loader active={this.state.refreshing} size="small" />
          </Dimmer>
        </Dimmer.Dimmable>
      );
      let display_name = this.props.user.profile
        ? this.props.user.profile.display_name
        : "?";
      const options = [
        {
          key: "user",
          text: (
            <span>
              Signed in as <strong>{display_name}</strong>
            </span>
          ),
          disabled: true
        },
        { key: "profile", text: "Your Profile" },
        { key: "stars", text: "Your Stars" },
        { key: "explore", text: "Explore" },
        { key: "integrations", text: "Integrations" },
        { key: "help", text: "Help" },
        { key: "settings", text: "Settings" },
        { key: "sign-out", text: "Sign Out", value: "sign-out" }
      ];
      button = (
        <Dropdown
          trigger={avatarWidget}
          options={options}
          icon={null}
          onChange={this.handleMenuSelect}
        />
      );
    }
    return button;
  }
}

export default connect(
  state => ({
    user: state.user
  }),
  { setUserTokens, clearUserState, setUserProfile }
)(LoginButton);

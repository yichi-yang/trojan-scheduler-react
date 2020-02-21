import React from "react";
import {
  Button,
  Message,
  Modal,
  Form,
  Segment,
  Image,
  Placeholder,
  Dropdown
} from "semantic-ui-react";
import { connect } from "react-redux";
import { setUserTokens, setUserProfile, clearUserState } from "./actions";
import jwtDecode from "jwt-decode";
import axios from "axios";

const CancelToken = axios.CancelToken;
const source = CancelToken.source();

class LoginButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      loginError: "",
      loadingLogin: false,
      modalOpen: false,
      userProfile: {}
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
    this.setState({ loadingLogin: true });
    axios
      .post(
        "/api/token/",
        {
          username,
          password
        },
        { skipAuthRefresh: true, cancelToken: source.token, NoJWT: true }
      )
      .then(response => {
        let { data } = response;
        setUserTokens(data);
        this.setState({
          loginError: "",
          modalOpen: false,
          loadingLogin: false,
          username: "",
          password: ""
        });
        this.getUserProfile(data);
      })
      .catch(error => {
        let { data } = error.response;
        let message = Object.entries(data)
          .map(
            ([key, value]) =>
              (key === "detail" ? "" : key + ": ") +
              (Array.isArray(value) ? value.join() : value)
          )
          .join("\n");
        this.setState({
          loginError: message,
          modalOpen: true,
          loadingLogin: false
        });
        clearUserState();
      });
  };

  getUserProfile = tokens => {
    if (!tokens || !tokens.access) {
      console.log("No access token.");
      return;
    }
    let { user_id } = jwtDecode(tokens.access);
    axios
      .get(`/api/users/${user_id}/`, { cancelToken: source.token })
      .then(response => {
        this.setState({ userProfile: response.data });
      })
      .catch(error => {
        console.log(error);
        console.log(String(error));
      });
  };

  handleOpen = () => this.setState({ modalOpen: true });

  handleClose = () =>
    this.setState({ modalOpen: false, username: "", password: "" });

  handleMenuSelect = (e, { value }) => {
    if (value === "sign-out") {
      this.props.clearUserState();
      this.setState({ userProfile: {} });
    }
  };

  componentDidMount() {
    let { tokens } = this.props.user;
    if (tokens) {
      this.getUserProfile(tokens);
    }
    this._hasTokens = Boolean(tokens);
  }

  componentDidUpdate() {
    let { tokens } = this.props.user;
    let hasToken = Boolean(tokens);
    if (this._hasTokens && !hasToken) {
      this.setState({ userProfile: {} });
    }
    this._hasTokens = hasToken;
  }

  componentWillUnmount() {
    source.cancel("axios requests cancelled on unmount");
  }

  render() {
    let button = null;
    let { loginError, loadingLogin } = this.state;
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
          <Form error={Boolean(loginError)} size="large">
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
                value={this.state.username}
                onChange={(e, props) => this.handleStateChange(e, props)}
              />
              <Form.Input
                fluid
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                type="password"
                name="password"
                value={this.state.password}
                onChange={(e, props) => this.handleStateChange(e, props)}
              />

              <Button
                color="teal"
                fluid
                size="large"
                onClick={this.login}
                loading={loadingLogin}
              >
                Login
              </Button>
            </Segment>
          </Form>
        </Modal>
      );
    } else {
      let { userProfile: profile } = this.state;
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
        <Image src={avatar} size="mini" rounded>
          {placeholder}
        </Image>
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

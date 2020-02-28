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
import {
  setUserTokens,
  setUserProfile,
  clearUserState,
  loadCoursebin,
  loadPreferences,
  loadSetting
} from "./actions";
import jwtDecode from "jwt-decode";
import axios from "axios";
import {
  errorFormatterCreator,
  responseDataFormatter,
  statusCodeFormatter,
  str2para,
  customMessageFormatter
} from "./util";

const errorFormatter = errorFormatterCreator(
  customMessageFormatter("Your session has expired. Log in to continue.", [
    401
  ]),
  customMessageFormatter,
  responseDataFormatter,
  statusCodeFormatter
);

class LoginButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      loginError: "",
      loadingLogin: false,
      modalOpen: false
    };
    this.cancelSource = axios.CancelToken.source();
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
        {
          skipAuthRefresh: true,
          cancelToken: this.cancelSource.token,
          NoJWT: true
        }
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
        this.setState({
          loginError: errorFormatter(error),
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
      .get(`/api/users/${user_id}/`, { cancelToken: this.cancelSource.token })
      .then(response => {
        this.props.setUserProfile(response.data);
        return axios.get(`/api/task-data/${response.data.saved_task_data}/`);
      })
      .then(response => {
        this.props.loadCoursebin(response.data.coursebin);
        this.props.loadPreferences(response.data.preference);
        this.props.loadSetting(response.data.setting);
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
    let { tokens } = this.props;
    if (tokens) {
      this.getUserProfile(tokens);
    }
  }

  componentDidUpdate() {}

  componentWillUnmount() {
    this.cancelSource.cancel(
      "axios requests cancelled on login button unmount"
    );
  }

  render() {
    let button = null;
    let { loginError, loadingLogin } = this.state;
    if (!this.props.tokens) {
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
              <Message error>{str2para(loginError)}</Message>
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
      let { profile } = this.props;
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
      let display_name = profile ? profile.display_name : "?";
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
    tokens: state.user.tokens,
    profile: state.user.profile
  }),
  {
    setUserTokens,
    clearUserState,
    setUserProfile,
    loadCoursebin,
    loadPreferences,
    loadSetting
  }
)(LoginButton);

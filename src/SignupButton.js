import React from "react";
import {
  Button,
  Message,
  Modal,
  Form,
  Image,
  Header,
  Item
} from "semantic-ui-react";
import { connect } from "react-redux";
import { setUserTokens, setUserProfile, clearUserState } from "./actions";
import axios from "axios";
import { error2message } from "./util";
import AvatarSelect from "./AvatarSelect";
import { avatarURL } from "./AvatarSelect";
import "shortid";
import shortid from "shortid";

const CancelToken = axios.CancelToken;
const source = CancelToken.source();

class SignupButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      password2: "",
      error: null,
      loading: false,
      modalOpen: false,
      page: "signup",
      userId: null,
      email: "",
      avatar: avatarURL + shortid.generate() + ".svg"
    };
  }

  handleStateChange = (event, { name, value }) => {
    if (this.state.hasOwnProperty(name)) {
      this.setState({ [name]: value });
    }
  };

  handleNavigate = (event, { value }) => {
    this.setState({ page: value, error: null });
  };

  handleAvatarSelect = avatar => {
    this.setState({ avatar });
  };

  handleSignUp = () => {
    let { username, password, password2 } = this.state;
    if (password !== password2) {
      this.setState({
        error: "Passwords do not match."
      });
      return;
    }
    this.setState({ loading: true });
    axios
      .post(
        "/api/users/",
        { username, password },
        { skipAuthRefresh: true, NoJWT: true, cancelToken: source.token }
      )
      .then(createAccountResponse => {
        let user = createAccountResponse.data;
        this.setState({ userId: user.id });
        this.props.setUserProfile(createAccountResponse.data);
        axios
          .post(
            "/api/token/",
            {
              username,
              password
            },
            { skipAuthRefresh: true, NoJWT: true, cancelToken: source.token }
          )
          .then(tokenResponse => {
            this.props.setUserTokens(tokenResponse.data);
            this.setState({
              loading: false,
              error: null,
              page: "email"
            });
          });
      })
      .catch(error => {
        this.setState({
          error: error2message(error, null, true),
          loading: false
        });
      });
  };

  handleUpdate = (e, { keys, next }) => {
    let filtered = {};
    keys.forEach(key => {
      if (this.state.hasOwnProperty(key)) filtered[key] = this.state[key];
    });
    this.setState({ loading: true });
    axios
      .patch(`/api/users/${this.state.userId}/`, filtered, {
        cancelToken: source.token
      })
      .then(response => {
        this.props.setUserProfile(response.data);
        this.setState({ loading: false, page: next });
      })
      .catch(error => {
        this.setState({
          error: error2message(error, null, true),
          loading: false
        });
      });
  };

  handleOpen = () => this.setState({ modalOpen: true });

  handleClose = () =>
    this.setState({
      modalOpen: false,
      username: "",
      password: "",
      password2: "",
      email: ""
    });

  componentDidMount() {}

  componentDidUpdate() {}

  componentWillUnmount() {
    source.cancel("axios requests cancelled on unmount");
  }

  render() {
    let button = null,
      content = null,
      action = null,
      title = null;
    let { loading, page, error } = this.state;
    if (!this.props.tokens) {
      button = (
        <Button onClick={this.handleOpen} secondary>
          Sign Up
        </Button>
      );
    }
    let message = error ? (
      <Message error={Boolean(error)}>
        {error.split("\n").map(line => (
          <p key={line}>{line}</p>
        ))}
      </Message>
    ) : null;
    if (page === "signup") {
      title = <Modal.Header>Sign Up</Modal.Header>;
      content = (
        <Modal.Content>
          <Form error={Boolean(error)}>
            {message}
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
            <Form.Input
              fluid
              icon="check"
              iconPosition="left"
              placeholder="Confirm password"
              type="password"
              name="password2"
              value={this.state.password2}
              onChange={(e, props) => this.handleStateChange(e, props)}
            />
          </Form>
        </Modal.Content>
      );
      action = (
        <Modal.Actions>
          <Button color="black" onClick={this.handleClose}>
            Cancel
          </Button>
          <Button
            positive
            icon="angle right"
            labelPosition="left"
            content="Confirm"
            onClick={this.handleSignUp}
            loading={loading}
          />
        </Modal.Actions>
      );
    } else if (page === "email") {
      title = <Modal.Header>Setup Account</Modal.Header>;
      content = (
        <Modal.Content>
          <Form error={Boolean(error)} size="large">
            <Item.Group>
              <Item>
                <Item.Content>
                  <Item.Header>Email</Item.Header>
                  <Item.Description>
                    Email is not required, but in case you lost your password,
                    we need a valid email address to help you reset it.
                  </Item.Description>
                  <Item.Meta>
                    In case you do decide to provide an email address, be sure
                    to verify it later in your profile page to confirm we can
                    reach you.
                  </Item.Meta>
                  {message}
                </Item.Content>
              </Item>
            </Item.Group>
            {message}
            <Form.Input
              fluid
              icon="mail"
              iconPosition="left"
              placeholder="email"
              name="email"
              value={this.state.email}
              onChange={(e, props) => this.handleStateChange(e, props)}
            />
          </Form>
        </Modal.Content>
      );
      action = (
        <Modal.Actions>
          <Button
            color="black"
            onClick={this.handleNavigate}
            content="Skip"
            value="avatar"
          />
          <Button
            positive
            icon="angle right"
            labelPosition="left"
            content="Next"
            loading={loading}
            keys={["email"]}
            next="avatar"
            onClick={this.handleUpdate}
          />
        </Modal.Actions>
      );
    } else if (page === "avatar") {
      title = <Modal.Header>Setup Account</Modal.Header>;
      content = (
        <Modal.Content>
          <Item.Group>
            <Item>
              <Item.Image src={this.state.avatar} />
              <Item.Content verticalAlign="middle">
                <Item.Header>Avatar</Item.Header>
                <Item.Description style={{ marginBottom: "15px" }}>
                  Use this randomly generated avatar or choose one you like.
                </Item.Description>
                {message}
                <AvatarSelect
                  default={this.state.avatar}
                  onSubmit={this.handleAvatarSelect}
                  buttonProps={{ content: "change" }}
                />
              </Item.Content>
            </Item>
          </Item.Group>
        </Modal.Content>
      );
      action = (
        <Modal.Actions>
          <Button
            color="black"
            onClick={this.handleNavigate}
            content="Back"
            value="email"
          />
          <Button
            positive
            icon="angle right"
            labelPosition="left"
            content="Next"
            loading={loading}
            keys={["avatar"]}
            next="done"
            onClick={this.handleUpdate}
          />
        </Modal.Actions>
      );
    } else if (page === "done") {
      title = <Modal.Header>Setup Account</Modal.Header>;
      content = (
        <Modal.Content>
          <Item.Group>
            <Item>
              <Item.Content>
                <Item.Header>Done</Item.Header>
                <Item.Description>
                  Great! You are all set! Remember can always edit your account
                  information in you profile. Have fun!
                </Item.Description>
              </Item.Content>
            </Item>
          </Item.Group>
        </Modal.Content>
      );
      action = (
        <Modal.Actions>
          <Button
            positive
            icon="check"
            labelPosition="left"
            content="Done"
            loading={loading}
            onClick={this.handleClose}
          />
        </Modal.Actions>
      );
    } else {
      title = <Modal.Header>{page}</Modal.Header>;
    }
    return (
      <Modal
        trigger={button}
        size="tiny"
        onClose={this.handleClose}
        open={this.state.modalOpen}
      >
        {title}
        {content}
        {action}
      </Modal>
    );
  }
}

export default connect(
  state => ({
    tokens: state.user.tokens
  }),
  { setUserTokens, clearUserState, setUserProfile }
)(SignupButton);

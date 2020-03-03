import React from "react";
import {
  Segment,
  Message,
  Header,
  Item,
  Form,
  Label,
  Input,
  Icon,
  Divider,
  Grid,
  Responsive
} from "semantic-ui-react";
import { connect } from "react-redux";
import axios from "axios";
import {
  errorFormatterCreator,
  responseDataFormatter,
  statusCodeFormatter
} from "../../util";
import { setUserProfile, clearUserState } from "../../actions";
import AvatarSelect from "./AvatarSelect";
import { toast } from "react-semantic-toasts";
import ProfileCard from "./ProfileCard";
import moment from "moment";

const errorFormatter = errorFormatterCreator(
  responseDataFormatter,
  statusCodeFormatter
);

class AccountPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profile: props.profile,
      loading: false
    };
    this.cancelSource = axios.CancelToken.source();
  }

  handleChange = (e, { name, value }) => {
    if (this.state.profile[name] !== undefined) {
      this.setState(state => ({
        profile: { ...state.profile, [name]: value }
      }));
    }
  };

  getUserProfile = () => {
    let { id } = this.props.profile;
    this.setState({ loading: true });
    axios
      .get(`/api/users/${id}/`, { cancelToken: this.cancelSource.token })
      .then(response => {
        this.props.setUserProfile(response.data);
        this.setState({ loading: false });
      })
      .catch(error => {
        toast({
          type: "error",
          icon: "times",
          title: `Failed to Load Profile`,
          list: errorFormatter(error).split("\n"),
          time: 10000
        });
        this.setState({ loading: false });
      });
  };

  saveUserProfile = () => {
    let { id } = this.props.profile;
    this.setState({ loading: true });
    axios
      .patch(`/api/users/${id}/`, this.state.profile, {
        cancelToken: this.cancelSource.token
      })
      .then(response => {
        this.props.setUserProfile(response.data);
        toast({
          type: "success",
          icon: "check",
          title: `Profile Updated`,
          description: "Your settings are saved.",
          time: 10000
        });
        this.setState({ loading: false, profile: response.data });
      })
      .catch(error => {
        toast({
          type: "error",
          icon: "times",
          title: `Failed to Update Profile`,
          list: errorFormatter(error).split("\n"),
          time: 10000
        });
        this.setState({ loading: false });
      });
  };

  signOutFromAllDevices = () => {
    this.setState({ loading: true });
    axios
      .post(
        `/api/token/invalidate/`,
        {},
        {
          cancelToken: this.cancelSource.token
        }
      )
      .then(() => {
        this.props.clearUserState();
        this.setState({ loading: false, profile: null });
      })
      .catch(error => {
        toast({
          type: "error",
          icon: "times",
          title: `Failed to Sign Out`,
          list: errorFormatter(error).split("\n"),
          time: 10000
        });
        this.setState({ loading: false });
      });
  };

  componentDidMount() {
    this.getUserProfile();
  }

  componentDidUpdate(prevProps) {
    if (Boolean(this.props.profile) !== Boolean(prevProps.profile)) {
      this.setState({ profile: this.props.profile });
    }
  }

  componentWillUnmount() {
    this.cancelSource.cancel(
      "axios requests cancelled on account page unmount"
    );
  }

  render() {
    if (!this.state.profile) {
      return (
        <Message info>Please log in to change your account settings.</Message>
      );
    }
    let {
      avatar,
      username,
      email,
      email_verified,
      show_email,
      nickname,
      first_name,
      last_name,
      display_name_choice,
      show_name,
      date_joined,
      show_date_joined
    } = this.state.profile;
    let displayNameOptions = [{ key: "username", text: username, value: "US" }];
    let full_name = first_name + " " + last_name;
    if (first_name)
      displayNameOptions.push({
        key: "first_name",
        text: first_name,
        value: "FR"
      });
    if (last_name)
      displayNameOptions.push({
        key: "last_name",
        text: last_name,
        value: "LS"
      });
    if (first_name && last_name)
      displayNameOptions.push({
        key: "full_name",
        text: full_name,
        value: "FL"
      });
    if (nickname)
      displayNameOptions.push({ key: "nickname", text: nickname, value: "NC" });
    return (
      <Segment className="dynamic" padded="very">
        <Grid stackable>
          <Grid.Column width="6">
            <Header>My Profile</Header>
            <ProfileCard {...this.props.profile} />
          </Grid.Column>
          <Grid.Column width="10">
            <Header>Account Settings</Header>

            <Form loading={this.state.loading}>
              <Form.Input fluid value={username} label="Username" readOnly />
              <Form.Field>
                <label>Email</label>
                <Input
                  value={email}
                  labelPosition="right"
                  name="email"
                  onChange={this.handleChange}
                >
                  <input />
                  {email_verified && (
                    <Label color="green">
                      <Icon name="check" style={{ margin: "0 0.2em" }} />
                    </Label>
                  )}
                  {!email_verified && email && (
                    <Label color="red">
                      <Responsive as="span" minWidth={350}>
                        not verified
                      </Responsive>
                      <Responsive
                        as={Icon}
                        maxWidth={349}
                        name="times"
                        style={{ margin: "0 0.2em" }}
                      />
                    </Label>
                  )}
                </Input>
              </Form.Field>

              <Form.Checkbox
                label="show my email on my profile page"
                checked={show_email}
                onChange={e =>
                  this.handleChange(e, {
                    name: "show_email",
                    value: !show_email
                  })
                }
              />

              <Form.Input
                fluid
                value={first_name}
                label="First name"
                name="first_name"
                onChange={this.handleChange}
              />
              <Form.Input
                fluid
                value={last_name}
                label="Last name"
                name="last_name"
                onChange={this.handleChange}
              />
              <Form.Input
                fluid
                value={nickname}
                label="Nickname"
                name="nickname"
                onChange={this.handleChange}
              />
              <Form.Checkbox
                label="show my name on my profile page"
                checked={show_name}
                onChange={e =>
                  this.handleChange(e, { name: "show_name", value: !show_name })
                }
              />
              <Form.Select
                fluid
                options={displayNameOptions}
                value={display_name_choice}
                label="Display Name"
                name="display_name_choice"
                onChange={this.handleChange}
              />
              <Form.Input
                fluid
                value={moment(date_joined).format("LL")}
                label="Date Joined"
                name="nickname"
                readOnly
              />
              <Form.Checkbox
                label="show date joined on my profile page"
                checked={show_date_joined}
                onChange={e =>
                  this.handleChange(e, {
                    name: "show_date_joined",
                    value: !show_date_joined
                  })
                }
              />
              <Item.Group>
                <Item>
                  <Item.Image
                    size="tiny"
                    src={avatar}
                    rounded
                    className="schedule-user-avatar"
                  />
                  <Item.Content verticalAlign="middle">
                    <AvatarSelect
                      default={avatar}
                      buttonProps={{ content: "Change Avatar", type: "button" }}
                      onSubmit={avatar =>
                        this.handleChange(null, {
                          name: "avatar",
                          value: avatar
                        })
                      }
                    />
                  </Item.Content>
                </Item>
              </Item.Group>
              <Form.Button
                content="Update"
                type="submit"
                color="green"
                fluid
                onClick={this.saveUserProfile}
              />
              {!email_verified && (
                <Form.Button
                  fluid
                  color="blue"
                  content="Verify Email (does not work yet)"
                />
              )}
              <Form.Button
                fluid
                color="black"
                content="Sign out From All Devices"
                onClick={this.signOutFromAllDevices}
              />
              <Divider horizontal section>
                Danger Zone
              </Divider>
              <Form.Button
                fluid
                color="red"
                content="Delete Account (does not work)"
              />
            </Form>
          </Grid.Column>
        </Grid>
      </Segment>
    );
  }
}

export default connect(
  state => ({
    profile: state.user.profile
  }),
  {
    setUserProfile,
    clearUserState
  }
)(AccountPage);

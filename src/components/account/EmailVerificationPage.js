import React from "react";
import { Segment, Header, Icon } from "semantic-ui-react";
import axios from "axios";
import {
  errorFormatterCreator,
  responseDataFormatter,
  statusCodeFormatter,
  matchStatusCode
} from "../../util";

const errorFormatter = errorFormatterCreator(
  matchStatusCode(() => 401, [401]),
  responseDataFormatter,
  statusCodeFormatter
);

class AccountPage extends React.Component {
  constructor(props) {
    super(props);
    let token = null;
    let success = false;
    if (this.props.location && this.props.location.search) {
      let params = new URLSearchParams(this.props.location.search);
      if (params.has("token")) token = params.get("token");
      if (params.has("success")) success = true;
    }
    this.state = {
      token,
      loading: false,
      error: null,
      success
    };
    this.cancelSource = axios.CancelToken.source();
  }

  verifyEmail = () => {
    let { token } = this.state;
    this.setState({ loading: true });
    axios
      .post(
        `/api/verify-email/`,
        {},
        {
          headers: {
            Authorization: "Bearer " + token
          },
          cancelToken: this.cancelSource.token,
          skipAuthRefresh: true,
          NoJWT: true
        }
      )
      .then(response => {
        this.setState({ loading: false, success: true }, () => {
          this.props.history.replace("./?success");
        });
      })
      .catch(error => {
        this.setState({ loading: false, error: errorFormatter(error) });
      });
  };

  componentDidMount() {
    if (this.state.token) {
      this.verifyEmail();
    }
  }

  render() {
    let { success, loading, error, token } = this.state;
    return (
      <Segment
        className="dynamic"
        padded="very"
        loading={loading}
        textAlign="center"
      >
        <Header size="large" as="h1">
          Email Verification
        </Header>
        {success && (
          <Header icon>
            <Icon name="check" />
            Email Verified
            <Header.Subheader>Log in to continue.</Header.Subheader>
          </Header>
        )}
        {error && error === 401 && (
          <Header icon>
            <Icon name="times" />
            Invalid Token
            <Header.Subheader>
              The token is not valid or has expired. Are you sure you copied the
              entire link?
            </Header.Subheader>
          </Header>
        )}
        {error && error !== 401 && (
          <Header icon>
            <Icon name="times" />
            Failed to Verify
            <Header.Subheader>{error}</Header.Subheader>
          </Header>
        )}
        {!success && !token && (
          <Header icon>
            <Icon name="expand" />
            No Token
            <Header.Subheader>
              Are you sure you copied the entire link?
            </Header.Subheader>
          </Header>
        )}
      </Segment>
    );
  }
}

export default AccountPage;

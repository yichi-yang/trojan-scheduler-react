import React from "react";
import { Header, Icon, Grid } from "semantic-ui-react";
import { Helmet } from "react-helmet";
import { formatTitle } from "../util";

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>{formatTitle("404")}</title>
      </Helmet>
      <Grid>
        <Grid.Column textAlign="center" style={{ paddingTop: "20vh" }}>
          <Header icon size="huge">
            <Icon name="meh" loading />
            404
            <Header.Subheader>
              Not sure what you are looking for...
            </Header.Subheader>
          </Header>
        </Grid.Column>
      </Grid>
    </>
  );
};

export default NotFound;

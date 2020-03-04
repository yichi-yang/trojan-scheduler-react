import React from "react";
import { Header, Icon, Grid } from "semantic-ui-react";

const NotFound = () => {
  return (
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
  );
};

export default NotFound;

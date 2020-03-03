import React, { useState } from "react";
import { Header, Image, Dimmer, Segment } from "semantic-ui-react";
import "./app/GroupSelect";

const randomImage = "https://source.unsplash.com/user/erondu/1600x400";

const NotFound = () => {
  let [dimmed, setDimmed] = useState(true);
  return (
    <Dimmer.Dimmable
      as={Segment}
      dimmed={dimmed}
      blurring
      style={{ padding: 0 }}
    >
      <Image src={randomImage} rounded />
      <Dimmer active onClick={() => setDimmed(!dimmed)}>
        <Header inverted size="huge">
          404 Not Found
        </Header>
      </Dimmer>
    </Dimmer.Dimmable>
  );
};

export default NotFound;

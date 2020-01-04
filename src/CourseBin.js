import React from "react";
import { Accordion } from "semantic-ui-react";

class CourseBin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Accordion>
        <Accordion.Title></Accordion.Title>
        <Accordion.Content></Accordion.Content>
      </Accordion>
    );
  }
}

export default CourseBin;

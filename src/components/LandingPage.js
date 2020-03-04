import React from "react";
import {
  Segment,
  Header,
  Container,
  Card,
  Image,
  Button,
  Responsive
} from "semantic-ui-react";

const LandingPage = () => {
  return (
    <>
      <Segment
        vertical
        inverted
        className="landing-page-segment"
        style={{ minHeight: "60vh", paddingLeft: "2em", paddingRight: "2em" }}
        textAlign="center"
      >
        <Responsive as="div" minWidth={495} style={{ height: "10vh" }} />
        <Header as="h1" inverted style={{ fontSize: "4em", marginTop: "8vh" }}>
          Trojan Scheduler
        </Header>
        <Header
          as="h2"
          inverted
          style={{ fontSize: "1.7em", marginTop: "1.5em" }}
        >
          Make schedules the easy way.
        </Header>
        <Button content="Get Started" size="huge" basic inverted />
        <Button content="Open Scheduler" size="huge" basic inverted />
      </Segment>
      <Container style={{ padding: "3em", paddingBottom: "9em" }}>
        {/* <Header as="h3" size="huge">
          More Topics
        </Header> */}
        <Card.Group itemsPerRow="3" stackable>
          <Card href="#">
            <Image
              src="https://source.unsplash.com/random/600x400/?start"
              wrapped
              ui={false}
            />
            <Card.Content>
              <Card.Header>Getting Started</Card.Header>
              <Card.Meta>bla bla bla</Card.Meta>
              <Card.Description>
                Learn how to use Trojan Scheduler. Lorem ipsum dolor sit amet,
                consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                labore et dolore magna aliqua. Sed risus ultricies tristique
                nulla aliquet enim tortor. Felis eget velit aliquet sagittis id
                consectetur. Sit amet tellus cras adipiscing. Convallis aenean
                et tortor at.
              </Card.Description>
            </Card.Content>
          </Card>
          <Card href="#">
            <Image
              src="https://source.unsplash.com/random/600x400/?question-mark"
              wrapped
              ui={false}
            />
            <Card.Content>
              <Card.Header>FAQ</Card.Header>
              <Card.Meta>bla bla bla</Card.Meta>
              <Card.Description>
                Learn how to use the scheduler. Elementum nisi quis eleifend
                quam adipiscing vitae proin sagittis nisl. Turpis egestas
                pretium aenean pharetra magna. Sed arcu non odio euismod lacinia
                at quis risus. Aliquam ultrices sagittis orci a scelerisque
                purus. Et tortor consequat id porta nibh venenatis cras. Aliquet
                risus feugiat in ante.
              </Card.Description>
            </Card.Content>
          </Card>
          <Card href="#">
            <Image
              src="https://source.unsplash.com/random/600x400/?change"
              wrapped
              ui={false}
            />
            <Card.Content>
              <Card.Header>Change Log</Card.Header>
              <Card.Meta>bla bla bla</Card.Meta>
              <Card.Description>
                See how Trojan Scheduler has changed. Dictum varius duis at
                consectetur lorem. Augue lacus viverra vitae congue eu consequat
                ac. Arcu bibendum at varius vel pharetra vel. Vivamus arcu felis
                bibendum ut tristique. Eleifend quam adipiscing vitae proin
                sagittis nisl rhoncus.
              </Card.Description>
            </Card.Content>
          </Card>
        </Card.Group>
      </Container>
    </>
  );
};

export default LandingPage;

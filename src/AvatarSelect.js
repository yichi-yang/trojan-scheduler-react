import React from "react";
import { Modal, Image, Button, Form, Grid, Input } from "semantic-ui-react";
import shortid from "shortid";

const avatarURL = "https://avatars.dicebear.com/v2/human/";

class AvatarSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: false, choices: null, selected: null, seed: "" };
  }

  open = () => {
    this.setState({ open: true });
  };

  close = () => {
    this.setState({ open: false });
  };

  cancel = () => {
    this.close();
  };

  submit = () => {
    if (this.props.onSubmit) {
      this.props.onSubmit(this.state.selected);
    }
    this.close();
  };

  handleSelect = value => {
    this.setState({ selected: value });
  };

  refreshChoices = () => {
    let choices = [];
    for (let i = 0; i < 8; i++) {
      choices.push(shortid.generate());
    }
    this.setState({ choices, selected: choices[0] });
  };

  handleSeedChange = (e, { value }) => {
    this.setState({ seed: value });
  };

  setSeed = () => {
    this.setState(state => {
      let encoded = encodeURIComponent(state.seed);
      if (state.choices.includes(encoded)) {
        return state;
      }
      let newChoices = state.choices.map(str =>
        str === state.selected ? encoded : str
      );
      let selected = state.selected;
      if (newChoices !== state.choices) {
        selected = encoded;
      }
      return { choices: newChoices, selected, seed: "" };
    });
  };

  componentDidMount() {
    this.refreshChoices();
  }

  id2Avatar = str => {
    let { selected } = this.state;
    let label = null;
    if (str === selected) {
      label = { corner: "left", icon: "checkmark", color: "green" };
    }
    return (
      <Grid.Column key={str}>
        <Image
          as="a"
          href="#"
          src={avatarURL + str + ".svg"}
          fluid
          rounded
          bordered
          label={label}
          onClick={e => {
            e.stopPropagation();
            this.handleSelect(str);
          }}
        />
      </Grid.Column>
    );
  };

  render() {
    let buttonProps = this.props.buttonProps
      ? { ...this.props.buttonProps }
      : {};
    let avatarGrid = null;
    let { choices } = this.state;
    if (choices) {
      avatarGrid = (
        <>
          <Grid columns={4} doubling>
            <Grid.Row>{choices.slice(0, 4).map(this.id2Avatar)}</Grid.Row>
            <Grid.Row>{choices.slice(4, 8).map(this.id2Avatar)}</Grid.Row>
          </Grid>
          <Form style={{ marginTop: "20px" }} onSubmit={this.setSeed}>
            <Form.Group widths="equal" inline>
              <Form.Field
                control={Button}
                fluid
                content="Change Choices"
                onClick={this.refreshChoices}
                primary
                type="button"
              />
              <Form.Field
                control={Input}
                placeholder="Avatar Seed"
                value={this.state.seed}
                onChange={this.handleSeedChange}
                action={
                  <Button primary onClick={this.setSeed} type="submit">
                    Set
                  </Button>
                }
                fluid
              />
            </Form.Group>
          </Form>
        </>
      );
    }
    return (
      <Modal
        trigger={
          <Button onClick={this.open} {...buttonProps}>
            Show Modal
          </Button>
        }
        open={this.state.open}
        onClose={this.close}
        size="small"
      >
        <Modal.Header>Select an Avatar</Modal.Header>

        <Modal.Content>{avatarGrid}</Modal.Content>

        <Modal.Actions>
          <Button color="black" onClick={this.cancel}>
            Cancel
          </Button>
          <Button
            positive
            icon="checkmark"
            labelPosition="left"
            content="Done"
            onClick={this.submit}
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

export default AvatarSelect;

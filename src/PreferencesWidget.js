import React from "react";
import {
  Container,
  Form,
  Segment,
  Header,
  Grid,
  Button,
  Table
} from "semantic-ui-react";
import { connect } from "react-redux";
import { TimeInput } from "semantic-ui-calendar-react";
import {
  editPreferences,
  addReservedSlot,
  removeReservedSlot
} from "./actions";
import shortid from "shortid";

class PreferencesWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reserved_from: "11:30",
      reserved_to: "12:30",
      reserved_length: "0:45",
      reserved_weight: 50,
      reserved_selected: []
    };
  }

  handleReduxUpdate = (event, { name, value }) => {
    this.props.editPreferences({ name, value });
  };

  handleReduxRangeUpdate = ({ target }, { name, value }) => {
    this.props.editPreferences({ name, value: target.valueAsNumber });
  };

  handleStateChange = (event, { name, value }) => {
    if (this.state.hasOwnProperty(name)) {
      this.setState({ [name]: value });
    }
  };

  handleStateRangeChange = ({ target }, { name, value }) => {
    if (this.state.hasOwnProperty(name)) {
      this.setState({ [name]: target.valueAsNumber });
    }
  };

  handleAddReserved = () => {
    let id = shortid.generate();
    this.props.addReservedSlot({
      key: id,
      begin: this.state.reserved_from,
      end: this.state.reserved_to,
      length: this.state.reserved_length,
      weight: this.state.reserved_weight
    });
  };

  handleRemoveReserved = () => {
    this.props.removeReservedSlot(this.state.reserved_selected);
    this.setState({ reserved_selected: [] });
  };

  selectReserved = key => {
    this.setState(state => {
      let isSelected = state.reserved_selected.includes(key);
      if (isSelected) {
        return {
          reserved_selected: state.reserved_selected.filter(
            item => item !== key
          )
        };
      } else {
        return { reserved_selected: state.reserved_selected.concat(key) };
      }
    });
  };

  render() {
    return (
      <Container>
        <Segment.Group>
          <Segment>
            <Header>Early Class</Header>
            <Form>
              <Form.Group>
                <Form.Input
                  label={`weight: ${this.props.early_weight}`}
                  min={0}
                  max={100}
                  name="early_weight"
                  step={5}
                  type="range"
                  value={this.props.early_weight}
                  width={12}
                  onChange={this.handleReduxRangeUpdate}
                />
                <Form.Field
                  width={4}
                  label="Start"
                  control={TimeInput}
                  name="early_time"
                  value={this.props.early_time}
                  placeholder="HH:MM"
                  iconPosition="left"
                  onChange={this.handleReduxUpdate}
                  closable
                />
              </Form.Group>
            </Form>
          </Segment>
          <Segment>
            <Header>Late Class</Header>
            <Form>
              <Form.Group>
                <Form.Input
                  label={`weight: ${this.props.late_weight}`}
                  min={0}
                  max={100}
                  name="late_weight"
                  step={5}
                  type="range"
                  value={this.props.late_weight}
                  width={12}
                  onChange={this.handleReduxRangeUpdate}
                />
                <Form.Field
                  width={4}
                  label="End"
                  control={TimeInput}
                  name="late_time"
                  value={this.props.late_time}
                  placeholder="HH:MM"
                  iconPosition="left"
                  onChange={this.handleReduxUpdate}
                  closable
                />
              </Form.Group>
            </Form>
          </Segment>
          <Segment>
            <Header>Break Length</Header>
            <Form>
              <Form.Group>
                <Form.Input
                  label={`weight: ${this.props.break_weight}`}
                  min={0}
                  max={100}
                  name="break_weight"
                  step={5}
                  type="range"
                  value={this.props.break_weight}
                  width={12}
                  onChange={this.handleReduxRangeUpdate}
                />
                <Form.Field
                  width={4}
                  label="Length"
                  control={TimeInput}
                  name="break_time"
                  value={this.props.break_time}
                  placeholder="HH:MM"
                  iconPosition="left"
                  onChange={this.handleReduxUpdate}
                  closable
                />
              </Form.Group>
            </Form>
          </Segment>
          <Segment>
            <Header>Reserved Time Slots</Header>
            <Grid stackable columns={2} width={16}>
              <Grid.Column width={9}>
                <Form>
                  <Form.Group widths={3}>
                    <Form.Field
                      label="From"
                      control={TimeInput}
                      name="reserved_from"
                      value={this.state.reserved_from}
                      placeholder="HH:MM"
                      iconPosition="left"
                      onChange={this.handleStateChange}
                      closable
                    />
                    <Form.Field
                      label="To"
                      control={TimeInput}
                      name="reserved_to"
                      value={this.state.reserved_to}
                      placeholder="HH:MM"
                      iconPosition="left"
                      onChange={this.handleStateChange}
                      closable
                    />
                    <Form.Field
                      label="Length"
                      control={TimeInput}
                      name="reserved_length"
                      value={this.state.reserved_length}
                      placeholder="HH:MM"
                      iconPosition="left"
                      onChange={this.handleStateChange}
                      closable
                    />
                  </Form.Group>
                  <Form.Input
                    label={`weight: ${this.state.reserved_weight}`}
                    min={0}
                    max={100}
                    name="reserved_weight"
                    step={5}
                    type="range"
                    value={this.state.reserved_weight}
                    onChange={this.handleStateRangeChange}
                  />
                  <Form.Group widths="equal">
                    <Form.Field
                      control={Button}
                      fluid
                      onClick={this.handleAddReserved}
                    >
                      Add
                    </Form.Field>
                    <Form.Field
                      control={Button}
                      fluid
                      onClick={this.handleRemoveReserved}
                    >
                      Remove
                    </Form.Field>
                  </Form.Group>
                </Form>
              </Grid.Column>
              <Grid.Column width={7}>
                <Table striped fixed selectable>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Begin</Table.HeaderCell>
                      <Table.HeaderCell>End</Table.HeaderCell>
                      <Table.HeaderCell>Length</Table.HeaderCell>
                      <Table.HeaderCell>Weight</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {this.props.reserved.map(r => (
                      <Table.Row
                        key={r.key}
                        active={this.state.reserved_selected.includes(r.key)}
                        onClick={() => this.selectReserved(r.key)}
                      >
                        <Table.Cell>{r.begin}</Table.Cell>
                        <Table.Cell>{r.end}</Table.Cell>
                        <Table.Cell>{r.length}</Table.Cell>
                        <Table.Cell>{r.weight}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Grid.Column>
            </Grid>
          </Segment>
        </Segment.Group>
      </Container>
    );
  }
}

export default connect(state => ({ ...state.preference }), {
  editPreferences,
  addReservedSlot,
  removeReservedSlot
})(PreferencesWidget);

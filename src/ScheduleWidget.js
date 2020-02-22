import React from "react";
import { Label, Placeholder, Table, Message } from "semantic-ui-react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { connect } from "react-redux";
import Rainbow from "rainbowvis.js";
import axios from "axios";
import { error2message } from "./util";

const localizer = momentLocalizer(moment);

const rainbow = new Rainbow();
rainbow.setSpectrum("#db2828", "#f2711c", "#fbbd08", "#b5cc18", "#21ba45");
rainbow.setNumberRange(0, 1);

class ScheduleWidget extends React.Component {
  constructor(props) {
    super(props);
    if (props.scheduleData) {
      this.state = { scheduleData: props.scheduleData };
    } else if (!props.schedule_id) {
      this.state = { error: "no schedule id in props" };
    } else {
      this.state = { scheduleData: undefined };
    }
  }

  weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  componentDidMount() {
    if (this.props.schedule_id) {
      axios
        .get(`/api/schedules/${this.props.schedule_id}/`)
        .then(response => {
          this.setState({ scheduleData: response.data });
        })
        .catch(error => {
          this.setState({ error: error2message(error) });
        });
    }
  }

  cost2HSL = cost => {
    return "#" + rainbow.colourAt(1 / (cost / 200 + 1));
  };

  render() {
    let content = "Nothing here...";
    if (!this.state.scheduleData) {
      content = (
        <Placeholder>
          <Placeholder.Line />
          <Placeholder.Line />
        </Placeholder>
      );
    } else if (this.state.error) {
      content = <Message error>{this.state.error}</Message>;
    } else if (this.state.scheduleData.sections) {
      let events = [];
      let start_moments = [];
      let end_moments = [];
      this.state.scheduleData.sections
        .filter(section => section.start && section.end)
        .forEach(section => {
          let start = moment(`1970-01-04 ${section.start}`);
          let end = moment(`1970-01-04 ${section.end}`);
          start_moments.push(start);
          end_moments.push(end);
          section.days.forEach(day => {
            events.push({
              start: start
                .clone()
                .add((day + 1) % 7, "d")
                .toDate(),
              end: end
                .clone()
                .add((day + 1) % 7, "d")
                .toDate(),
              title: `${section.course_name} (${section.section_id})\n${section.section_type}`,
              tooltip:
                `\n${section.course_name} (${section.section_id})\n` +
                `${section.section_type}\n${section.registered}\n` +
                `${section.instructor}\n${section.location}`
            });
          });
        });

      let min = moment
        .min(start_moments)
        .clone()
        .startOf("hour")
        .subtract(1, "h")
        .toDate();
      let max = moment
        .max(end_moments)
        .clone()
        .endOf("hour")
        .add(1, "h")
        .toDate();

      content = (
        <>
          <Label.Group>
            <Label
              style={{
                backgroundColor: this.cost2HSL(
                  this.state.scheduleData.total_score
                ),
                color: "white"
              }}
            >
              Total
              <Label.Detail>{this.state.scheduleData.total_score}</Label.Detail>
            </Label>
            <Label
              style={{
                backgroundColor: this.cost2HSL(
                  this.state.scheduleData.early_score
                ),
                color: "white"
              }}
            >
              Early
              <Label.Detail>{this.state.scheduleData.early_score}</Label.Detail>
            </Label>
            <Label
              style={{
                backgroundColor: this.cost2HSL(
                  this.state.scheduleData.late_score
                ),
                color: "white"
              }}
            >
              Late
              <Label.Detail>{this.state.scheduleData.late_score}</Label.Detail>
            </Label>
            <Label
              style={{
                backgroundColor: this.cost2HSL(
                  this.state.scheduleData.break_score
                ),
                color: "white"
              }}
            >
              Breaks
              <Label.Detail>{this.state.scheduleData.break_score}</Label.Detail>
            </Label>
            <Label
              style={{
                backgroundColor: this.cost2HSL(
                  this.state.scheduleData.reserved_score
                ),
                color: "white"
              }}
            >
              Reserved
              <Label.Detail>
                {this.state.scheduleData.reserved_score}
              </Label.Detail>
            </Label>
          </Label.Group>

          <Calendar
            localizer={localizer}
            events={events}
            min={min}
            max={max}
            views={["work_week"]}
            defaultView="work_week"
            toolbar={false}
            tooltipAccessor="tooltip"
            defaultDate={moment("1970-01-05 00:00:00").toDate()}
            formats={{
              dayFormat: "ddd"
            }}
          />

          <Table fixed celled>
            <Table.Body>
              {this.state.scheduleData.sections.map(section => (
                <Table.Row key={section.section_id}>
                  <Table.Cell>
                    {section.section_id + (section.need_clearance ? "D" : "R")}
                  </Table.Cell>
                  <Table.Cell>{section.course_name}</Table.Cell>
                  <Table.Cell>{section.section_type}</Table.Cell>
                  <Table.Cell>
                    {section.days.map(day => this.weekDays[day]).join(", ")}
                  </Table.Cell>
                  <Table.Cell>
                    {section.start && section.end
                      ? section.start.substring(0, 5) +
                        "-" +
                        section.end.substring(0, 5)
                      : "TBD"}
                  </Table.Cell>
                  <Table.Cell>{section.registered}</Table.Cell>
                  <Table.Cell>{section.instructor}</Table.Cell>
                  <Table.Cell>{section.location}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </>
      );
    }
    return content;
  }
}

export default connect(state => ({
  tokens: state.user.tokens
}))(ScheduleWidget);

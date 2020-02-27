import React from "react";
import { Label, Table, Message, Grid } from "semantic-ui-react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import Rainbow from "rainbowvis.js";
import axios from "axios";
import ShareButtons from "./ShareButtons";
import {
  getScheduleName
} from "./util";

const localizer = momentLocalizer(moment);

const rainbow = new Rainbow();
rainbow.setSpectrum("#db2828", "#f2711c", "#fbbd08", "#b5cc18", "#21ba45");
rainbow.setNumberRange(0, 1);

class ScheduleWidget extends React.Component {
  constructor(props) {
    super(props);
    this.cancelSource = axios.CancelToken.source();
  }

  weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  cost2HSL = cost => {
    return "#" + rainbow.colourAt(1 / (cost / 200 + 1));
  };

  componentWillUnmount() {
    this.cancelSource.cancel("axios requests cancelled on unmount 2");
  }

  render() {
    let { scheduleData } = this.props;

    let content = null;
    if (!scheduleData) {
      content = <Message error>No schedule data in props</Message>;
    }
    if (!scheduleData.sections) {
      content = <Message info>Empty schedule</Message>;
    } else {
      let events = [];
      let start_moments = [];
      let end_moments = [];
      scheduleData.sections
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
          <Grid stackable style={{ marginBottom: 0 }}>
            <Grid.Column width={10} verticalAlign="middle">
              <Label.Group>
                <Label
                  style={{
                    backgroundColor: this.cost2HSL(scheduleData.total_score),
                    color: "white"
                  }}
                >
                  Total
                  <Label.Detail>{scheduleData.total_score}</Label.Detail>
                </Label>
                <Label
                  style={{
                    backgroundColor: this.cost2HSL(scheduleData.early_score),
                    color: "white"
                  }}
                >
                  Early
                  <Label.Detail>{scheduleData.early_score}</Label.Detail>
                </Label>
                <Label
                  style={{
                    backgroundColor: this.cost2HSL(scheduleData.late_score),
                    color: "white"
                  }}
                >
                  Late
                  <Label.Detail>{scheduleData.late_score}</Label.Detail>
                </Label>
                <Label
                  style={{
                    backgroundColor: this.cost2HSL(scheduleData.break_score),
                    color: "white"
                  }}
                >
                  Breaks
                  <Label.Detail>{scheduleData.break_score}</Label.Detail>
                </Label>
                <Label
                  style={{
                    backgroundColor: this.cost2HSL(scheduleData.reserved_score),
                    color: "white"
                  }}
                >
                  Reserved
                  <Label.Detail>{scheduleData.reserved_score}</Label.Detail>
                </Label>
              </Label.Group>
            </Grid.Column>
            {scheduleData.public && (
              <Grid.Column
                width={4}
                verticalAlign="middle"
                textAlign="right"
                floated="right"
              >
                <ShareButtons
                  title={getScheduleName(scheduleData)}
                  description={getScheduleName(scheduleData)}
                  link={window.location.href}
                />
              </Grid.Column>
            )}
            {this.props.topRightWidget && (
              <Grid.Column width={2} verticalAlign="middle" floated="right">
                {this.props.topRightWidget}
              </Grid.Column>
            )}
          </Grid>

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
              {scheduleData.sections.map(section => (
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

export default ScheduleWidget;

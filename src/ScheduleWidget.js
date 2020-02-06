import React from "react";
import { Label, Placeholder, Table, Message } from "semantic-ui-react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { connect } from "react-redux";

const localizer = momentLocalizer(moment);

class ScheduleWidget extends React.Component {
  constructor(props) {
    super(props);
    if (props.schedule_data) {
      this.state = { schedule_data: props.schedule_data };
    } else if (!props.schedule_id) {
      this.state = { schedule_data: { error: "no schedule id in props" } };
    } else {
      this.state = { schedule_data: undefined };
    }
  }

  weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  componentDidMount() {
    let fetchOptions = {
      method: "GET",
      headers: { Accept: "application/json" }
    };
    if (this.props.tokens && this.props.tokens.access) {
      fetchOptions.headers[
        "Authorization"
      ] = `Bearer ${this.props.tokens.access}`;
    }
    if (!this.state.schedule_data && this.props.schedule_id) {
      fetch(`/api/schedules/${this.props.schedule_id}/`, fetchOptions)
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error(
            `schedule-${this.props.schedule_id} ${response.status} ${Response.statusText}`
          );
        })
        .then(data => {
          this.setState({ schedule_data: data });
        })
        .catch(error => {
          this.setState({ schedule_data: { error: error.message } });
        });
    }
  }

  render() {
    let content = null;
    if (!this.state.schedule_data) {
      content = (
        <Placeholder>
          <Placeholder.Line />
          <Placeholder.Line />
        </Placeholder>
      );
    } else if (this.state.schedule_data.error) {
      content = <Message error>{this.state.schedule_data.error}</Message>;
    } else {
      let events = [];
      let start_moments = [];
      let end_moments = [];
      this.state.schedule_data.sections
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
            <Label>
              Total
              <Label.Detail>
                {this.state.schedule_data.total_score}
              </Label.Detail>
            </Label>
            <Label>
              Early
              <Label.Detail>
                {this.state.schedule_data.early_score}
              </Label.Detail>
            </Label>
            <Label>
              Late
              <Label.Detail>{this.state.schedule_data.late_score}</Label.Detail>
            </Label>
            <Label>
              Breaks
              <Label.Detail>
                {this.state.schedule_data.break_score}
              </Label.Detail>
            </Label>
            <Label>
              Reserved
              <Label.Detail>
                {this.state.schedule_data.reserved_score}
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
              {this.state.schedule_data.sections.map(section => (
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

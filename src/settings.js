import moment from "moment";

export const termOptions = [
  {
    key: "20202",
    text: "Summer 2020",
    value: "20202"
  },
  {
    key: "20201",
    text: "Spring 2020",
    value: "20201"
  },
  {
    key: "20193",
    text: "Fall 2019",
    value: "20193"
  }
];

export const defaultTerm = "20201";

export const coursebinCourseLifetime = moment.duration(10, "m");
export const scheduleSectionLifetime = moment.duration(10, "m");
export const scheduleExpireAfter = 30;

export const siteName = "Trojan Scheduler";

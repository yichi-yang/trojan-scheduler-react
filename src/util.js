const createCourse = courseData => ({
  type: "course",
  course: courseData.name,
  term: courseData.term,
  updated: courseData.updated,
  key: courseData.name,
  node_id: courseData.name
});

const createPart = (course, partNum) => ({
  type: "part",
  course: course.course,
  part: partNum,
  key: course.key + "." + partNum,
  node_id: course.node_id + "." + partNum,
  parent: course.node_id
});

const createComponent = (part, componentName) => ({
  type: "component",
  course: part.course,
  part: part.part,
  component: componentName,
  key: part.key + "." + componentName,
  node_id: part.node_id + "." + componentName,
  parent: part.node_id
});

const createSection = (component, sectionData) => ({
  type: "section",
  course: component.course,
  part: component.part,
  component: component.component,
  key: component.key + "." + sectionData.section_id,
  node_id: component.node_id + "." + sectionData.section_id,
  parent: component.node_id,
  ...sectionData
});

export const transformCourse = course => {
  let result = [];

  // course node
  let currCourse = createCourse(course);
  result.push(currCourse);

  let componentsVisited = new Set();
  let currPart = null;
  let currComponent = null;
  let partCount = 0;
  let prevType = null;

  for (let section of course.sections) {
    if (prevType !== section.section_type) {
      if (componentsVisited.has(section.section_type) || partCount === 0) {
        // new part node
        currPart = createPart(currCourse, partCount);
        partCount++;

        result.push(currPart);

        componentsVisited.clear();
      }

      // new component node
      currComponent = createComponent(currPart, section.section_type);

      result.push(currComponent);
      componentsVisited.add(currComponent.component);

      prevType = section.section_type;
    }

    result.push(createSection(currComponent, section));
  }

  return result;
};

export const join = (base, path) => {
  return base.charAt(base.length - 1) === "/" ? base + path : base + "/" + path;
};

export const addTrailingSlash = url => {
  return url.charAt(url.length - 1) === "/" ? url : url + "/";
};

export const getScheduleName = (schedule, altId) => {
  if (schedule && schedule.name) return schedule.name;
  if (schedule && schedule.id) return `Schedule ${schedule.id}`;
  if (altId) return `Schedule ${altId}`;
  return "Schedule ?";
};

export const error2message = (
  error,
  noPermissionMessage = null,
  useResponse = false
) => {
  if (useResponse && error.response && error.response.data) {
    return Object.entries(error.response.data)
      .map(
        ([key, value]) =>
          (key === "detail" ? "" : key + ": ") +
          (Array.isArray(value) ? value.join() : value)
      )
      .join("\n");
  }
  if (
    noPermissionMessage &&
    error.response &&
    error.response.status &&
    [401, 403].includes(error.response.status)
  ) {
    return noPermissionMessage;
  }
  if (
    noPermissionMessage &&
    error.response &&
    error.response.status &&
    error.response.statusText
  ) {
    return error.response.status + " " + error.response.statusText;
  }
  return String(error);
};

export const transformCourse = course => {
  let result = [];

  // course node
  result.push({
    type: "course",
    key: course.name,
    course_name: course.name,
    course_term: course.term,
    course_updated: course.updated,
    node_id: course.name,
    group: course.group
  });

  let existingComponents = new Map();
  for (let section of course.sections) {
    if (!existingComponents.has(section.section_type)) {
      // new component node
      let componentKey = course.name + "." + section.section_type;
      result.push({
        type: "component",
        component_name: section.section_type,
        key: componentKey,
        parent: course.name,
        course_name: course.name,
        node_id: componentKey
      });
      existingComponents.set(section.section_type, componentKey);
    }

    let componentKey = existingComponents.get(section.section_type);

    //new section node
    result.push({
      type: "section",
      key: componentKey + "." + section.section_id,
      parent: componentKey,
      course_name: course.name,
      node_id: componentKey + "." + section.section_id,
      ...section
    });
  }

  return result;
};

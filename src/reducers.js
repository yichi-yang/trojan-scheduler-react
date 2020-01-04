import { createReducer } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import {
  addCourse,
  toggleCourseInclude,
  toggleCoursePenalize,
  deleteCourse,
  addLoadingCourse,
  removeLoadingCourse,
  addMessage,
  removeMessage
} from "./actions";
import { transformCourse } from "./util";

export const courseReducer = createReducer([], {
  [addCourse]: (state, action) => {
    let course = action.payload;
    let prevNodeMap = new Map();
    for (let node of state) {
      if (node.course_name === course.name) {
        prevNodeMap.set(node.node_id, node);
      }
    }

    let prevGroup = state
      .filter(node => node.type === "course" && !node.loading)
      .reduce((acc, curr) => Math.max(acc, curr.group), 0);

    let prevCourseNode = state.find(
      node => node.node_id === course.name && node.type === "course"
    );
    if (prevCourseNode && prevCourseNode.group) {
      course.group = prevCourseNode.group;
    } else {
      course.group = prevGroup + 1;
    }

    let newCourseArray = transformCourse(course);

    for (let i in newCourseArray) {
      if (prevNodeMap.has(newCourseArray[i].node_id)) {
        newCourseArray[i] = {
          ...prevNodeMap.get(newCourseArray[i].node_id),
          ...newCourseArray[i]
        };
      }
    }
    return state
      .filter(node => node.course_name !== course.name)
      .concat(newCourseArray);
  },
  [toggleCourseInclude]: (state, action) => {
    let node_id = action.payload;
    for (let node of state) {
      if (node.node_id === node_id) {
        node.exclude = !node.exclude;
        break;
      }
    }
  },
  [toggleCoursePenalize]: (state, action) => {
    let node_id = action.payload;
    for (let node of state) {
      if (node.node_id === node_id) {
        node.exempt = !node.exempt;
        break;
      }
    }
  },
  [deleteCourse]: (state, action) => {
    let course = action.payload;
    return state.filter(node => node.course_name !== course || node.loading);
  },
  [addLoadingCourse]: (state, action) => {
    let course = action.payload;
    let loadingNode = {
      course_name: course,
      type: "course",
      loading: true,
      node_id: course + ".loading",
      key: course + ".loading"
    };
    if (!state.find(node => node.node_id === loadingNode.node_id)) {
      state.push(loadingNode);
    }
  },
  [removeLoadingCourse]: (state, action) => {
    let course = action.payload;
    return state.filter(node => node.node_id !== course + ".loading");
  }
});

export const messageReducer = createReducer([], {
  [addMessage]: (state, action) => {
    let message = action.payload;
    state.push(message);
  },
  [removeMessage]: (state, action) => {
    let message = action.payload;
    let index = state.indexOf(message);
    if (index >= 0) {
      state.splice(index, 1);
    }
  }
});

export const allReducers = combineReducers({
  course: courseReducer,
  message: messageReducer
});

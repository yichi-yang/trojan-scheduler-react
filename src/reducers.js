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
  removeMessage,
  editPreferences,
  addReservedSlot,
  removeReservedSlot
} from "./actions";
import { transformCourse } from "./util";

export const courseReducer = createReducer([], {
  [addCourse]: (state, action) => {
    let course = action.payload;
    let prevNodeMap = new Map();
    for (let node of state) {
      if (node.course === course.name) {
        prevNodeMap.set(node.node_id, node);
      }
    }

    let newCourseArray = transformCourse(course);

    for (let i in newCourseArray) {
      if (prevNodeMap.has(newCourseArray[i].node_id)) {
        newCourseArray[i] = {
          ...prevNodeMap.get(newCourseArray[i].node_id),
          ...newCourseArray[i]
        };
      }
      if (newCourseArray[i].type === "course" && !newCourseArray[i].group) {
        let prevGroup = state
          .filter(node => node.type === "course" && !node.loading)
          .reduce((acc, curr) => Math.max(acc, curr.group), 0);
        newCourseArray[i].group = prevGroup + 1;
      }
    }

    return state
      .filter(node => node.course !== course.name)
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
    return state.filter(node => node.course !== course || node.loading);
  },
  [addLoadingCourse]: (state, action) => {
    let course = action.payload;
    let loadingNode = {
      course: course,
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
    let key = action.payload;
    return state.filter(msg => msg.key !== key);
  }
});

export const preferenceReducer = createReducer(
  {
    early_time: "10:00",
    early_weight: 75,
    late_time: "15:00",
    late_weight: 25,
    break_time: "00:10",
    break_weight: 50,
    reserved: [
      {
        key: "#default0",
        begin: "11:30",
        end: "12:30",
        length: "0:45",
        weight: 50
      },
      {
        key: "#default1",
        begin: "17:30",
        end: "18:30",
        length: "0:45",
        weight: 50
      }
    ]
  },
  {
    [editPreferences]: (state, action) => {
      let { name, value } = action.payload;
      if (state.hasOwnProperty(name)) {
        state[name] = value;
      }
    },
    [addReservedSlot]: (state, action) => {
      let reserved = action.payload;
      state.reserved.push(reserved);
    },
    [removeReservedSlot]: (state, action) => {
      let toRemove = action.payload;
      state.reserved = state.reserved.filter(r => !toRemove.includes(r.key));
    }
  }
);

export const allReducers = combineReducers({
  course: courseReducer,
  message: messageReducer,
  preference: preferenceReducer
});
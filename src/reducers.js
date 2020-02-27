import { createReducer } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import {
  addCourse,
  toggleCourseInclude,
  toggleCoursePenalize,
  recursiveSetPenalize,
  deleteCourse,
  setIncludeCourse,
  editPreferences,
  addReservedSlot,
  removeReservedSlot,
  saveTaskResult,
  setUserProfile,
  setUserTokens,
  clearUserState,
  setGroupCourse,
  resetCourseGroup,
  startGroupFromOne,
  loadCoursebin,
  loadPreferences
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
          .filter(node => node.type === "course")
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
    return state.filter(node => node.course !== course);
  },
  [setIncludeCourse]: (state, action) => {
    let include = action.payload;
    state.forEach(node => {
      if (node.type === "section") {
        node.exclude = !include;
      }
    });
  },
  [setGroupCourse]: (state, action) => {
    let { group, node_id } = action.payload;
    for (let node of state) {
      if (node.node_id === node_id) {
        node.group = group;
        return;
      }
    }
  },
  [startGroupFromOne]: (state, action) => {
    let groups = new Set(
      state.filter(node => node.type === "course").map(node => node.group)
    );
    let sortedGroups = [...groups].sort((a, b) => a - b);
    let groupMap = new Map();
    for (let i = 0; i < sortedGroups.length; i++) {
      groupMap.set(sortedGroups[i], i + 1);
    }
    state.forEach(node => {
      if (node.type === "course") {
        node.group = groupMap.get(node.group);
      }
    });
  },
  [resetCourseGroup]: (state, action) => {
    let i = 0;
    state.forEach(node => {
      if (node.type === "course") {
        node.group = ++i;
      }
    });
  },
  [recursiveSetPenalize]: (state, action) => {
    let { node_id, exempt } = action.payload;
    let children = [node_id];
    do {
      let prevChildren = [...children];
      state
        .filter(node => prevChildren.includes(node.node_id))
        .forEach(node => {
          node.exempt = exempt;
        });
      children = state
        .filter(node => prevChildren.includes(node.parent))
        .map(node => node.node_id);
    } while (children.length > 0);
  },
  [loadCoursebin]: (state, action) => {
    let coursebin = action.payload;
    if (coursebin !== null) return coursebin;
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
        from: "11:30",
        to: "12:30",
        wiggle: "01:00",
        weight: 50
      },
      {
        key: "#default1",
        from: "17:30",
        to: "18:30",
        wiggle: "01:00",
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
    },
    [loadPreferences]: (state, action) => {
      let preference = action.payload;
      if (preference !== null) return preference;
    }
  }
);

export const taskResultReducer = createReducer(null, {
  [saveTaskResult]: (state, action) => {
    let result = action.payload;
    return result;
  }
});

export const userReducer = createReducer(
  { tokens: null, profile: null },
  {
    [setUserTokens]: (state, action) => {
      let tokens = action.payload;
      state.tokens = { ...state.tokens, ...tokens };
    },
    [setUserProfile]: (state, action) => {
      let profile = action.payload;
      state.profile = profile;
    },
    [clearUserState]: (status, action) => {
      return { tokens: null, profile: null };
    }
  }
);

export const allReducers = combineReducers({
  course: courseReducer,
  preference: preferenceReducer,
  task_result: taskResultReducer,
  user: userReducer
});

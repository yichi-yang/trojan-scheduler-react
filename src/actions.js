import {createAction} from "@reduxjs/toolkit"

export const addCourse = createAction("courses/add");
export const toggleCourseInclude = createAction("courses/toggleInclude");
export const toggleCoursePenalize = createAction("courses/togglePenalize");
export const deleteCourse = createAction("courses/delete");
export const addLoadingCourse = createAction("courses/addLoading");
export const removeLoadingCourse = createAction("courses/removeLoading");
export const addMessage = createAction("message/add");
export const removeMessage = createAction("message/remove");
export const editPreferences = createAction("preferences/edit");
export const addReservedSlot = createAction("reserved/add");
export const removeReservedSlot = createAction("reserved/remove");
export const saveTaskResult = createAction("task/save");
export const setUserTokens = createAction("user/setToken");
export const setUserProfile = createAction("user/setProfile");
export const clearUserState = createAction("user/clear");
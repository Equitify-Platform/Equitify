import { createSlice } from "@reduxjs/toolkit";
import { ProjectType, getLaunchpads } from '../actions/launchpads.actions';

interface InitialState {
    projects: ProjectType[];
}

const initialState: InitialState = {
    projects: [],
};

export const launchpadsSlice = createSlice({
    name: 'launchpads',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getLaunchpads.fulfilled, (state, action) => {
            state.projects = action.payload;
        });
    },
})

export const launchpadsReducer = launchpadsSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";

import { Offer, Protection } from "../../contracts/equitifyPlatform";
import { getOffers, getProtections } from "../actions/equitify.actions";

interface InitialState {
  offers: Offer[];
  protections: Protection[];
}

const initialState: InitialState = {
  offers: [],
  protections: [],
};

export const equitifySlice = createSlice({
  name: "equitify",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getOffers.fulfilled, (state, action) => {
      state.offers = action.payload;
    });
    builder.addCase(getProtections.fulfilled, (state, action) => {
      state.protections = action.payload;
    });
  },
});

export const equitifyReducer = equitifySlice.reducer;

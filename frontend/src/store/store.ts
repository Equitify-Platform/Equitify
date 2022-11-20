import {
  combineReducers,
  configureStore,
  ThunkAction,
  Action,
} from "@reduxjs/toolkit";

import { equitifyReducer } from "./reducers/equitify.reducer";
import { launchpadsReducer } from "./reducers/launchpads.reducer";
import { stakingReducer } from "./reducers/staking.reducer";
import { walletReducer } from "./reducers/wallet.reducer";

const rootReducer = combineReducers({
  launchpads: launchpadsReducer,
  staking: stakingReducer,
  wallet: walletReducer,
  equitify: equitifyReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store["dispatch"];

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

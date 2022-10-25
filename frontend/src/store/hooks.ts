import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import { RootState, AppDispatch } from "./store";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useLaunchpads = () => useAppSelector((store) => store.launchpads);
export const useLaunchpad = (address: string) =>
  useAppSelector((store) =>
    store.launchpads.projects.find(
      (p) => p.address.toLowerCase() === address.toLowerCase()
    )
  );
export const useStaking = () => useAppSelector((store) => store.staking);
export const useWallet = () => useAppSelector((store) => store.wallet);

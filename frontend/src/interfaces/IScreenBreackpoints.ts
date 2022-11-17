export type State<T> = {
  [key: string]: T;
};

export type BreakpointChecks = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
} & State<boolean>;

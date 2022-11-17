import { ReactNode } from "react";

export type IPaginatorType = "num" | "dot";

export interface PaginatorPropsType {
  type: IPaginatorType;
  totalCount: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (pageNumber: number) => void;
}

export interface PaginatorPageProps {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}

export type PaginatorDotPageProps = Omit<PaginatorPageProps, "children">;

export interface IPaginatorHook {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  siblingCount?: number;
}

export interface IPageDesktop {
  pageNumber: number | string;
  currentPage: number;
  onPageClick: () => void;
}

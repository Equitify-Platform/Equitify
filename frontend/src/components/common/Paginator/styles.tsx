import styled from "styled-components";

export const PaginatorContainer = styled("div")`
  display: flex;
  gap: 41px;
  flex-direction: row;
  align-items: center;
  @media screen and (max-width: 576px) {
    gap: 14px;
  }
`;
export const PaginatorPagesContainer = styled("div")`
  display: flex;
  gap: 16px;
  flex-direction: row;
  align-items: center;
`;

export const PaginatorArrow = styled("img")<{ disabled?: boolean }>`
  width: 32px;
  height: 32px;
  cursor: ${({ disabled }) => (disabled ? "unset" : "pointer")};
  opacity: ${({ disabled }) => (disabled ? "0.5" : "1")};
`;

export const PaginatorPageText = styled.p<{ active?: boolean }>`
  font-family: DM Sans;
  font-weight: 700;
  font-size: 16px;
  line-height: 20px;
  color: ${({ active }) => (active ? "#0F1138" : "#414660")};
  cursor: ${({ active }) => (active ? "default" : "pointer")};
`;
export const PaginatorPageDot = styled.p<{ active?: boolean }>`
  background-color: ${({ active }) => (active ? "#0F1138" : "#ffffff")};
  cursor: ${({ active }) => (active ? "default" : "pointer")};
  height: 8px;
  width: 8px;
  border-radius: 50%;
`;

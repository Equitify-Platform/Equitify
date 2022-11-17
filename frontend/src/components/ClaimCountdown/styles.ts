import { IdoStage } from "../../types/IdoStage";

export const getStyles = (idoStage: IdoStage) => {
  const styles = {
    wrapper: {
      display: "flex",
      justifyContent: "center",
      gap: idoStage === IdoStage.PRESALE ? "89px" : "19px",
    },
    item: {
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "center",
      alignItems: "center",
    },
    value: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontWeight: idoStage === IdoStage.PRESALE ? 700 : 400,
      fontSize: idoStage === IdoStage.PRESALE ? "64px" : "36px",
      lineHeight: idoStage === IdoStage.PRESALE ? "72px" : "47px",
      color: "var(--secondary)",
    },
    label: {
      fontHeight: 400,
      fontSize: "12px",
      lineHeight: "16px",
      color: "var(--primary)",
    },
  };
  return styles;
};

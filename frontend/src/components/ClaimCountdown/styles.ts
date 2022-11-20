import { IdoStage } from "../../types/IdoStage";

export const getStyles = (idoStage: IdoStage, pageWidth: number) => {
  const styles = {
    wrapper: {
      display: "flex",
      justifyContent: "center",
      gap:
        idoStage === IdoStage.PRESALE
          ? pageWidth > 576
            ? "89px"
            : "17px"
          : pageWidth > 576
          ? "19px"
          : "34px",
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
      fontSize:
        idoStage === IdoStage.PRESALE
          ? pageWidth > 576
            ? "64px"
            : "40px"
          : pageWidth > 576
          ? "36px"
          : "32px",
      lineHeight:
        idoStage === IdoStage.PRESALE
          ? pageWidth > 576
            ? "72px"
            : "48px"
          : pageWidth > 576
          ? "47px"
          : "42px",
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

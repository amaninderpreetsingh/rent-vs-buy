import { BuyingInputs } from "../types";

export const getAppreciationRate = (buying: BuyingInputs): number => {
  switch (buying.appreciationScenario) {
    case "low":
      return 2;
    case "medium":
      return 4;
    case "high":
      return 6;
    case "custom":
      return buying.customAppreciationRate;
    default:
      return 3;
  }
};

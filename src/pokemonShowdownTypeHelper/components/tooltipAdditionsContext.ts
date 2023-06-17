import { createContext, useContext } from "nano-jsx";
import { TypesGroupedByDamageMultiplier } from "../types";

export interface TooltipAdditionsContext {
  pokemon: Pokemon;
  damageRelations: TypesGroupedByDamageMultiplier;
}

const context = createContext(undefined);

export default context;
export const useTooltipAdditionsContext = (): TooltipAdditionsContext =>
  useContext(context);

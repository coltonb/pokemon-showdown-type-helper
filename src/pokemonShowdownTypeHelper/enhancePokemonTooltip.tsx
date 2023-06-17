import { render } from "nano-jsx";
import TooltipAdditions from "./components/tooltipAdditions";
import { Logger } from "./logger";
import { TypesGroupedByDamageMultiplier } from "./types";
import Pokedex from "pokedex-promise-v2";

const PokeAPI = new Pokedex();

/**
 * Enhances a Pokemon Showdown tooltip with additional information.
 */
export default async function enhancePokemonTooltip(
  tooltipHTML: string,
  pokemon: Pokemon
): Promise<string> {
  const tooltipContainer = document.createElement("div");
  tooltipContainer.innerHTML = tooltipHTML;

  const tooltipHeader = tooltipContainer.querySelector("h2");

  if (!tooltipHeader) {
    Logger.debug("Could not find header in tooltip, skipping insert.");
    return tooltipHTML;
  }

  render(
    <TooltipAdditions
      damageRelations={await getTypesGroupedByDamageMultiplier(pokemon)}
      pokemon={pokemon}
    />
  )
    .reverse()
    .map((element: HTMLElement) => {
      tooltipContainer.insertBefore(element, tooltipHeader.nextSibling);
    });

  return tooltipContainer.innerHTML;
}

/**
 * Calculates the total damage relations for the Pokemon.
 * @returns A map of each multiplier to the types affected.
 */
async function getTypesGroupedByDamageMultiplier(
  pokemon: Pokemon
): Promise<TypesGroupedByDamageMultiplier> {
  return Array.from(
    (
      await Promise.all(
        pokemon
          .getTypeList()
          .map((type) => PokeAPI.getTypeByName(type.toLowerCase()))
      )
    )
      .map((type) => type.damage_relations)
      .reduce((acc, damageRelation) => {
        damageRelation["double_damage_from"].map((type) =>
          acc.set(type.name, (acc.get(type.name) ?? 1) * 2)
        );
        damageRelation["half_damage_from"].map((type) =>
          acc.set(type.name, (acc.get(type.name) ?? 1) * 0.5)
        );
        damageRelation["no_damage_from"].map((type) => acc.set(type.name, 0));

        return acc;
      }, new Map<string, number>())
      .entries()
  ).reduce((acc, [type, multiplier]) => {
    if (multiplier === 1) {
      return acc;
    }

    return acc.set(multiplier, (acc.get(multiplier) ?? []).concat([type]));
  }, new Map<number, string[]>());
}

import { PokeAPI } from "./pokeAPI";

export class PokemonShowdown {
  TYPE_IMAGE_WIDTH = 32;
  TYPE_IMAGE_HEIGHT = 14;
  TOOLTIP_CONTAINER_ID = "tooltipwrapper";
  POKEMON_TOOLTIP_SELECTOR =
    ".tooltip-pokemon, .tooltip-activepokemon";

  pokeAPI: PokeAPI.PokeAPIClient

  constructor(pokeAPI: PokeAPI.PokeAPIClient) {
    this.pokeAPI = pokeAPI;
  }

  getTypeImageSrc(type: string) {
    return `https://play.pokemonshowdown.com/sprites/types/${type}.png`;
  }

  /**
   * @param {string} type
   * @returns An HTML img element for the supplied type
   */
  getTypeImageElement(type: string): HTMLImageElement {
    const showdownTypeName = `${type.charAt(0).toUpperCase()}${type
      .toLowerCase()
      .slice(1)}`;

    const src = this.getTypeImageSrc(showdownTypeName);
    const image = document.createElement("img");

    image.setAttribute("alt", showdownTypeName);
    image.setAttribute("src", src);
    image.setAttribute("width", this.TYPE_IMAGE_WIDTH.toString());
    image.setAttribute("height", this.TYPE_IMAGE_HEIGHT.toString());
    image.classList.add("pixelated");

    return image;
  }

  /**
   * Fetches the list of types from the passed tooltip element.
   * @param tooltipElement
   * @returns The list of types found in the tooltip element.
   */
  getTypes(tooltipElement: Element): string[] {
    const images = Array.from(
      tooltipElement.querySelectorAll("img")
    ) as HTMLImageElement[];
    return images
      .filter((image) => image.getAttribute("width") === "32")
      .map((image) => image.getAttribute("alt")!.toLowerCase());
  }

  /**
   * Injects the type damage relations into the passed tooltip element.
   * @param tooltipElement
   */
  async modifyTooltip(
    tooltipElement: HTMLElement
  ) {
    const headerNode = tooltipElement.querySelector("h2");

    if (headerNode === null || headerNode.parentNode === null) {
      console.error(
        "Failed to inject type information; Showdown update may have broken this."
      );
      return;
    }

    const types = this.getTypes(tooltipElement);
    const damageRelations = await this.getDamageRelationsForTypes(
      types
    );

    const sortedDamageRelations = Array.from(damageRelations.keys()).sort();

    for (const damageMultiplier of sortedDamageRelations) {
      const types = damageRelations.get(damageMultiplier);
      const resistanceValueElement = document.createElement("p");
      const resistanceValueText = document.createElement("small");

      resistanceValueText.innerText = `x${damageMultiplier}: `;

      resistanceValueElement.appendChild(resistanceValueText);
      for (let type of types!) {
        resistanceValueElement.appendChild(this.getTypeImageElement(type));
      }

      headerNode.parentNode.insertBefore(
        resistanceValueElement,
        headerNode.nextSibling
      );
    }

    // Remove CSS top property to force tooltips to always render below the mouse
    // This prevents the added types from causing the tooltip to go offscreen.
    tooltipElement.parentElement!.parentElement!.style.top = "";
  }

  
/**
 * Calculates the total damage relations for the supplied list of types.
 * @param types
 * @returns A map of each type to the damage relationship multiplier.
 */
async getDamageRelationsForTypes(
  types: string[]
): Promise<Map<number, string[]>> {
  const damageRelations = (
    await Promise.all(types.map((type) => this.pokeAPI.getTypeInformation(type)))
  ).map((type) => type.damage_relations);

  const totalDamageRelations: { [type: string]: number } = {};

  const damageRelationMap = new Map<keyof PokeAPI.TypeRelations, number>([
    ["double_damage_from", 2],
    ["no_damage_from", 0],
    ["half_damage_from", 0.5],
  ]);

  for (let damageRelation of damageRelations) {
    for (const [relationName, multiplier] of damageRelationMap) {
      for (let type of damageRelation[relationName]) {
        const { name } = type;
        if (totalDamageRelations[name] === undefined) {
          totalDamageRelations[name] = multiplier;
        } else {
          totalDamageRelations[name] *= multiplier;
        }
      }
    }
  }

  const damageRelationsGroupedByMultiplier = new Map<number, string[]>();

  for (const [type, multiplier] of Object.entries(totalDamageRelations)) {
    if (multiplier === 1) {
      continue;
    }

    if (damageRelationsGroupedByMultiplier.get(multiplier) === undefined) {
      damageRelationsGroupedByMultiplier.set(multiplier, []);
    }
    damageRelationsGroupedByMultiplier.get(multiplier)!.push(type);
  }

  return damageRelationsGroupedByMultiplier;
}

}

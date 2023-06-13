import Pokedex from "pokedex-promise-v2";
import { Logger } from "./logger";

export class Tooltip {
  static pokeAPI = new Pokedex();

  pokemon: Pokemon;
  tooltipContainer: HTMLDivElement;

  constructor(pokemon: Pokemon, tooltipHTML: string) {
    this.pokemon = pokemon;
    this.tooltipContainer = document.createElement("div");
    this.tooltipContainer.innerHTML = tooltipHTML;
  }

  get header(): HTMLElement | null {
    return this.tooltipContainer.querySelector("h2");
  }

  get innerHTML(): string {
    return this.tooltipContainer.innerHTML;
  }

  /**
   * Injects additional information into the tooltip.
   */
  async enhance() {
    await this.injectDamageRelations();
    this.injectStats();
  }

  private insertElement(element: HTMLElement) {
    if (!this.header) {
      Logger.debug("Could not find header in tooltip, skipping insert.");
      return;
    }

    this.tooltipContainer.insertBefore(element, this.header.nextSibling);
  }

  /**
   * Injects the pokemon's damage relations into the passed tooltip element.
   */
  private async injectDamageRelations() {
    const damageRelations = await this.getDamageRelationsGroupedByMultiplier();
    const sortedDamageRelations = Array.from(damageRelations.keys()).sort();

    for (const damageMultiplier of sortedDamageRelations) {
      const types = damageRelations.get(damageMultiplier);
      const resistanceValueContainer = document.createElement("p");
      const resistanceValueText = document.createElement("small");

      resistanceValueText.innerText = `x${damageMultiplier}: `;

      resistanceValueContainer.appendChild(resistanceValueText);
      for (let type of types!) {
        resistanceValueContainer.appendChild(this.createTypeImage(type));
      }

      this.insertElement(resistanceValueContainer);
    }
  }

  /**
   * Injects the pokemon's stats into the passed tooltip element.
   */
  private injectStats() {
    const STAT_MAP: { [stat: string]: string } = {
      hp: "HP",
      atk: "Atk",
      def: "Def",
      spa: "SpA",
      spd: "SpD",
      spe: "Spe",
    };

    const statsElement = document.createElement("p");

    for (const [name, value] of Object.entries(
      this.pokemon.getSpecies().baseStats
    )) {
      const statElement = document.createElement("span");
      statElement.innerText = `${STAT_MAP[name]}:${value} `;
      statElement.style.fontSize = "10px";
      statElement.style.marginRight = "4px";
      statsElement.appendChild(statElement);
    }

    this.insertElement(statsElement);
  }

  /**
   * Calculates the total damage relations for the supplied list of types.
   * @returns A map of each type to the damage relationship multiplier.
   */
  private async getDamageRelationsGroupedByMultiplier(): Promise<TypesGroupedByMultiplier> {
    const damageRelations = (
      await Promise.all(
        this.pokemonTypes.map((type) => Tooltip.pokeAPI.getTypeByName(type))
      )
    ).map((type) => type.damage_relations);

    const totalDamageRelations: { [type: string]: number } = {};

    const damageRelationMap = new Map<
      keyof Pokedex.TypeDamageRelations,
      number
    >([
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

    const damageRelationsGroupedByMultiplier: TypesGroupedByMultiplier =
      new Map<number, string[]>();

    for (const [type, multiplier] of Object.entries(totalDamageRelations)) {
      if (multiplier === 1) {
        continue;
      }

      if (!damageRelationsGroupedByMultiplier.has(multiplier)) {
        damageRelationsGroupedByMultiplier.set(multiplier, []);
      }

      damageRelationsGroupedByMultiplier.get(multiplier)!.push(type);
    }

    return damageRelationsGroupedByMultiplier;
  }

  private get pokemonTypes() {
    return this.pokemon.terastallized
      ? [this.pokemon.terastallized.toLowerCase()]
      : this.pokemon.getSpecies().types.map((type) => type.toLowerCase());
  }

  /**
   * @returns the Pokemon Showdown URL for the type image.
   */
  private getTypeImageSrc(type: string): string {
    return `https://play.pokemonshowdown.com/sprites/types/${type}.png`;
  }

  /**
   * @returns An HTML img element for the supplied type.
   */
  private createTypeImage(type: string): HTMLImageElement {
    const TYPE_IMAGE_WIDTH = 32;
    const TYPE_IMAGE_HEIGHT = 14;

    type = this.formatTypeNameforImage(type);

    const src = this.getTypeImageSrc(type);
    const image = document.createElement("img");

    image.setAttribute("alt", type);
    image.setAttribute("src", src);
    image.setAttribute("width", TYPE_IMAGE_WIDTH.toString());
    image.setAttribute("height", TYPE_IMAGE_HEIGHT.toString());
    image.classList.add("pixelated");

    return image;
  }

  private formatTypeNameforImage(type: string): string {
    return `${type.charAt(0).toUpperCase()}${type.toLowerCase().slice(1)}`;
  }
}

type TypesGroupedByMultiplier = Map<number, string[]>;

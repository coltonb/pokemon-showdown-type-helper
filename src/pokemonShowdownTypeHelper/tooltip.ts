import Pokedex from "pokedex-promise-v2";
import { Logger } from "./logger";

declare var Dex: Dex;

export class Tooltip {
  static pokeAPI = new Pokedex();
  static readonly DATA_ATTRIBUTE = "data-psth-tag";
  static readonly STAT_NAME_MAP: { [stat: string]: string } = {
    hp: "HP",
    atk: "Atk",
    def: "Def",
    spa: "SpA",
    spd: "SpD",
    spe: "Spe",
  };

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
    const damageRelationsContainer = document.createElement("div");
    Tooltip.tagElement(damageRelationsContainer, "damage-relations");

    const damageRelations = await this.getDamageRelationsGroupedByMultiplier();
    const sortedDamageRelations = Array.from(damageRelations.keys()).sort(
      (a, b) => b - a
    );

    for (const damageMultiplier of sortedDamageRelations) {
      const types = damageRelations.get(damageMultiplier)!;
      const resistanceValueContainer = document.createElement("p");
      Tooltip.tagElement(
        resistanceValueContainer,
        `damage-relation-x${damageMultiplier}`
      );
      resistanceValueContainer.style.display = "flex";
      resistanceValueContainer.style.alignItems = "center";

      const resistanceValueText = document.createElement("small");
      Tooltip.tagElement(resistanceValueText, "damage-relation-text");
      resistanceValueText.style.marginRight = "1ch";
      resistanceValueText.textContent = `x${damageMultiplier}:`;

      resistanceValueContainer.appendChild(resistanceValueText);

      for (let type of types) {
        const imageContainer = document.createElement("div");
        imageContainer.innerHTML = Dex.getTypeIcon(type);

        const image = imageContainer.firstChild! as HTMLImageElement;
        Tooltip.tagElement(image, type);

        resistanceValueContainer.insertAdjacentHTML(
          "beforeend",
          imageContainer.innerHTML
        );
      }

      damageRelationsContainer.appendChild(resistanceValueContainer);
    }
    this.insertElement(damageRelationsContainer);
  }

  /**
   * Injects the pokemon's stats into the passed tooltip element.
   */
  private injectStats() {
    const statsElement = document.createElement("p");
    Tooltip.tagElement(statsElement, "stats");
    statsElement.style.fontSize = "10px";

    for (const [name, value] of Object.entries(
      this.pokemon.getSpecies().baseStats
    )) {
      const statElement = document.createElement("span");
      Tooltip.tagElement(statElement, name);
      statElement.textContent = `${Tooltip.STAT_NAME_MAP[name]}:${value}`;
      statElement.style.marginRight = `1.25ch`;
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
        this.pokemon
          .getTypeList()
          .map((type) => Tooltip.pokeAPI.getTypeByName(type.toLowerCase()))
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

  /**
   * Tags an element with a custom data attribute.
   */
  private static tagElement(element: HTMLElement, tag: string) {
    element.setAttribute(Tooltip.DATA_ATTRIBUTE, tag);
  }
}

type TypesGroupedByMultiplier = Map<number, string[]>;

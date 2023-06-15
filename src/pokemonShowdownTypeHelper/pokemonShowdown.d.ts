interface BaseStats {
  atk: number;
  def: number;
  hp: number;
  spa: number;
  spd: number;
  spe: number;
}

interface Species {
  baseStats: BaseStats;
}

interface Pokemon {
  getTypeList(): string[];
  getSpecies(): Species;
}

interface BattleTooltips {
  prototype: {
    showPokemonTooltip(
      clientPokemon: Pokemon | null,
      serverPokemon: Pokemon | null,
      isActive?: boolean,
      illusionIndex?: number
    ): string;

    placeTooltip(
      innerHTML: string,
      hoveredElem?: HTMLElement,
      notRelativeToParent?: boolean,
      type?: string
    ): boolean | undefined;
  };
}

interface Dex {
  getTypeIcon(type: string): string;
}

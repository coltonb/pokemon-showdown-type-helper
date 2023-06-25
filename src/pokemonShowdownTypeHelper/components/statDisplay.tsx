import { Component } from "nano-jsx";
import { useTooltipAdditionsContext } from "./tooltipAdditionsContext";

export default class StatDisplay extends Component {
  static readonly STAT_NAME_MAP: { [stat: string]: string } = {
    hp: "HP",
    atk: "Atk",
    def: "Def",
    spa: "SpA",
    spd: "SpD",
    spe: "Spe",
  };

  get pokemon(): Pokemon {
    return useTooltipAdditionsContext().pokemon;
  }

  get pokemonStats() {
    return Object.entries(this.pokemon.getSpecies().baseStats);
  }

  getStatName(statName: string) {
    return StatDisplay.STAT_NAME_MAP[statName];
  }

  getStatText(statName: string, statValue: number) {
    return `${this.getStatName(statName)}:${statValue}`;
  }

  render() {
    return (
      <p data-psth-tag="stats" style={{ fontSize: "10px" }}>
        {this.pokemonStats.map(([statName, statValue]) => {
          return (
            <span data-psth-tag={statName} style={{ marginRight: "1.25ch" }}>
              {this.getStatText(statName, statValue)}
            </span>
          );
        })}
      </p>
    );
  }
}

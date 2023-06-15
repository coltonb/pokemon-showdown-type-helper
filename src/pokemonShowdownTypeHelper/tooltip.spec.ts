import { Tooltip } from "./tooltip";

const tooltipHTML = `
<h2>
  Cupid <small>(Enamorus-Therian)</small>
  <img
    src="https://play.pokemonshowdown.com/fx/gender-f.png"
    alt="F"
    width="7"
    height="10"
    class="pixelated"
  />
  <br /><span class="textaligned-typeicons"
    ><img
      src="https://play.pokemonshowdown.com/sprites/types/Fairy.png"
      alt="Fairy"
      height="14"
      width="32"
      class="pixelated" />
    <img
      src="https://play.pokemonshowdown.com/sprites/types/Flying.png"
      alt="Flying"
      height="14"
      width="32"
      class="pixelated"
  /></span>
</h2>
<p><small>HP:</small> 75%</p>
<p><small>Possible abilities:</small> Overcoat</p>
<p><small>Item:</small> Leftovers</p>
<p>
  <small>Spe</small> 87 to 210
  <small>(before items/abilities/modifiers)</small>
</p>
<p class="section">
  • Calm Mind <small>(28/32)</small><br />• Draining Kiss
  <small>(14/16)</small><br />• Iron Defense <small>(22/24)</small><br />•
  Protect <small>(14/16)</small><br />
</p>
`;

class Species implements Species {
  baseStats: BaseStats = {
    atk: 100,
    def: 100,
    hp: 100,
    spa: 100,
    spd: 100,
    spe: 100,
  };
}

class Pokemon implements Pokemon {
  getSpecies() {
    return new Species();
  }
  getTypeList() {
    return ["Fairy", "Flying"];
  }
}

class Dex implements Dex {
  getTypeIcon() {
    return "<img />";
  }
}

const pokemon: Pokemon = new Pokemon();

(global as any).Dex = new Dex();

let tooltip: Tooltip;

beforeEach(() => {
  tooltip = new Tooltip(pokemon, tooltipHTML);
});

describe("Tooltip", () => {
  describe("innerHTML", () => {
    it("returns the HTML content for the tooltip", () => {
      expect(tooltip.innerHTML).toEqual(formatHTML(tooltipHTML));
    });
  });

  describe("enhance", () => {
    it("adds stats tooltip", async () => {
      await tooltip.enhance();

      const statsElement = getElement(tooltip.tooltipContainer, "stats")!;

      expect(statsElement).not.toBeNull();

      for (const [stat, value] of Object.entries(
        pokemon.getSpecies().baseStats
      )) {
        const statElement = getElement(statsElement, stat)!;

        expect(statElement).not.toBeNull();

        expect(statElement.textContent).toEqual(
          `${Tooltip.STAT_NAME_MAP[stat]}:${value}`
        );
      }
    });

    it("adds damage relations to the tooltip", async () => {
      const expectedDamageRelations = {
        "2": ["poison", "rock", "steel", "electric", "ice"],
        "0.5": ["dark", "grass"],
        "0.25": ["fighting", "bug"],
        "0": ["ground", "dragon"],
      };

      await tooltip.enhance();

      const damageRelationsContainer = getElement(
        tooltip.tooltipContainer,
        "damage-relations"
      )!;

      expect(damageRelationsContainer).not.toBeNull();
      expect(damageRelationsContainer.children.length).toEqual(
        Object.keys(expectedDamageRelations).length
      );

      for (const [multiplier, types] of Object.entries(
        expectedDamageRelations
      )) {
        const damageRelationContainer = getElement(
          tooltip.tooltipContainer,
          `damage-relation-x${multiplier}`
        )!;

        expect(damageRelationContainer).not.toBeNull();

        const damageRelationTextContainer = getElement(
          damageRelationContainer,
          "damage-relation-text"
        )!;

        expect(damageRelationTextContainer).not.toBeNull();
        expect(damageRelationTextContainer.textContent).toEqual(
          `x${multiplier}: `
        );
        expect(damageRelationContainer.children.length).toEqual(
          types.length + 1
        );

        for (const type of types) {
          const typeElement = getElement(damageRelationContainer, type);
          expect(typeElement).not.toBeNull();
        }
      }
    });

    describe("when the tooltip is in an unexpected format", () => {
      const errorMessage = "An error occurred loading the tooltip.";

      beforeEach(() => {
        tooltip = new Tooltip(pokemon, errorMessage);
      });

      it("makes no changes", async () => {
        await tooltip.enhance();

        expect(tooltip.innerHTML).toEqual(errorMessage);
      });
    });
  });
});

function formatHTML(html: string) {
  const container = document.createElement("div");
  container.innerHTML = html;
  return container.innerHTML;
}

function getElement(element: HTMLElement, tag: string): HTMLElement | null {
  return element.querySelector(`[${Tooltip.DATA_ATTRIBUTE}="${tag}"`);
}

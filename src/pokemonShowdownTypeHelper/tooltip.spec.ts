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
  getTypeIcon(type: string) {
    return `<img data-jest="${type}" />`;
  }
}

const pokemon: Pokemon = new Pokemon();

(global as any).Dex = new Dex();

describe("Tooltip", () => {
  describe("innerHTML", () => {
    it("returns the HTML content for the tooltip", () => {
      const tooltip = new Tooltip(pokemon, tooltipHTML);

      expect(tooltip.innerHTML).toEqual(formatHTML(tooltipHTML));
    });
  });

  describe("enhance", () => {
    it("adds stats and type relationships to the tooltip HTML", async () => {
      const tooltip = new Tooltip(pokemon, tooltipHTML);

      await tooltip.enhance();

      const expectedDamageMultipliers = {
        "2": [],
      };

      const statsElement = getElement(tooltip.tooltipContainer, "stats")!;

      expect(getElement(statsElement, "atk")!.textContent).toEqual("Atk:100");
      expect(getElement(statsElement, "def")!.textContent).toEqual("Def:100");
      expect(getElement(statsElement, "hp")!.textContent).toEqual("HP:100");
      expect(getElement(statsElement, "spa")!.textContent).toEqual("SpA:100");
      expect(getElement(statsElement, "spd")!.textContent).toEqual("SpD:100");
      expect(getElement(statsElement, "spe")!.textContent).toEqual("Spe:100");
    });
  });
});

function formatHTML(html: string) {
  const container = document.createElement("div");
  container.innerHTML = html;
  return container.innerHTML;
}

function getElement(element: HTMLElement, name: string): HTMLElement | null {
  return element.querySelector(`[data-jest="${name}"`);
}

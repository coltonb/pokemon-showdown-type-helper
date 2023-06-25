import enhancePokemonTooltip from "./enhancePokemonTooltip";
import { Logger } from "./logger";

declare var BattleTooltips: BattleTooltips;

class PokemonShowdownMethods {
  static showPokemonTooltip = BattleTooltips.prototype.showPokemonTooltip;
  static placeTooltip = BattleTooltips.prototype.placeTooltip;
}

class PokemonShowdownTypeHelper {
  static Overrides = class {
    /**
     * Override that injects additional information into the tooltip HTML.
     * This method is changed to async so that it can retrieve information dynamically
     * from https://pokeapi.co/
     */
    static async showPokemonTooltip(
      clientPokemon: Pokemon | null,
      serverPokemon: Object | null,
      ...args: any[]
    ): Promise<string> {
      const tooltipHTML = PokemonShowdownMethods.showPokemonTooltip.call(
        this,
        clientPokemon,
        serverPokemon,
        ...args
      );

      if (!clientPokemon) {
        return tooltipHTML;
      }

      return await enhancePokemonTooltip(tooltipHTML, clientPokemon);
    }

    /**
     * Override that handles the Promise<string> returned from
     * the showPokemonTooltip override.
     */
    static placeTooltip(innerHTML: Promise<string> | string, ...args: any[]) {
      if (innerHTML instanceof Promise) {
        innerHTML.then((html) => {
          PokemonShowdownMethods.placeTooltip.call(this, html, ...args);
        });
        return true;
      }

      return PokemonShowdownMethods.placeTooltip.call(this, innerHTML, ...args);
    }
  };

  /**
   * Overrides Pokemon Showdown methods to inject additional information into the tooltip.
   */
  static bootstrap() {
    // The override method is casted as any to permit assignment despite changing from sync to async function.
    BattleTooltips.prototype.showPokemonTooltip = PokemonShowdownTypeHelper
      .Overrides.showPokemonTooltip as any;

    BattleTooltips.prototype.placeTooltip =
      PokemonShowdownTypeHelper.Overrides.placeTooltip;

    Logger.log("Successfully initialized.");
  }
}

PokemonShowdownTypeHelper.bootstrap();

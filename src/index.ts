import { PokeAPI } from "./pokeAPI";
import { PokemonShowdown } from "./pokemonShowdown";

const pokeAPIClient = new PokeAPI.PokeAPIClient();

/**
 * Watches for new tooltips to be added to the DOM. Parses and injects type
 * damage relations when the appropriate tooltip element is found.
 */
const observer = new MutationObserver((mutations) => {
  for (let mutation of mutations) {
    for (let addedNode of mutation.addedNodes) {
      if (addedNode.nodeType !== 1) continue;

      const element = addedNode as Element;

      if (element.id !== PokemonShowdown.TOOLTIP_CONTAINER_ID) continue;

      const tooltipElement = document.querySelector(
        PokemonShowdown.POKEMON_TOOLTIP_SELECTOR
      ) as HTMLElement;

      if (tooltipElement === null) continue;

      PokemonShowdown.modifyTooltip(pokeAPIClient, tooltipElement);
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });

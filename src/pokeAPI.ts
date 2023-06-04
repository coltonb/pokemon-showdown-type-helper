import axios from "axios";

export namespace PokeAPI {
  export class PokeAPIClient {
    /**
     * Retrieves information about a given Pokemon type
     * @param type The type to look up
     * @returns The type information
     */
    async getTypeInformation(type: string): Promise<Type> {
      return await this.get(`https://pokeapi.co/api/v2/type/${type}/`);
    }

    /**
     * Retrieves stats about a given Pokemon
     * @param pokemon The Pokemon to look up
     * @returns The Pokemon's stats
     */
    async getPokemonStats(pokemon: string): Promise<PokemonStats> {
      const data = await this.get(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
      if (data) {
        return {
          name: data.name,
          stats: data.stats.map((stat: any) => ({
            name: stat.stat.name,
            base_stat: stat.base_stat,
            effort: stat.effort,
          })),
        };
      } else {
        console.log('no data found for', pokemon);
        throw new Error(`No data found for ${pokemon}`);
      }
    }

    private cache: { [url: string]: any } = {};

    private async get(url: string) {
      if (this.cache[url] === undefined) {
        try{
          const response = await axios.get(url);
          this.cache[url] = response.data;
        } catch (e) {
          console.error('failed to fetch', url, e)
          return null;
        }
      }
      return this.cache[url];
    }
  }

  export interface Type {
    name: string;
    damage_relations: TypeRelations;
  }

  export interface TypeRelations {
    no_damage_to: Type[];
    half_damage_to: Type[];
    double_damage_to: Type[];
    no_damage_from: Type[];
    half_damage_from: Type[];
    double_damage_from: Type[];
  }

  export interface PokemonStats {
    name: string;
    stats: Stat[];
  }
  export interface Stat {
    name: string;
    base_stat: number;
    effort: number;
  }
}

import { PokeAPI } from "./pokeAPI";

/**
 * Calculates the total damage relations for the supplied list of types.
 * @param types
 * @returns A map of each type to the damage relationship multiplier.
 */
export async function getDamageRelationsForTypes(
  pokeAPI: PokeAPI.PokeAPIClient,
  types: string[]
): Promise<Map<number, string[]>> {
  const damageRelations = (
    await Promise.all(types.map((type) => pokeAPI.getTypeInformation(type)))
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

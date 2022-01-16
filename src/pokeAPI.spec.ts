import { PokeAPI } from "./pokeAPI";
import axios from "axios";

describe("PokeAPIClient", () => {
  const pokeAPI = new PokeAPI.PokeAPIClient();

  describe("getTypeInformation", () => {
    test("returns type damage relations as expected", async () => {
      const spy = jest.spyOn(axios, "get");
      const result = "test";

      spy.mockResolvedValue({ data: result });

      expect(await pokeAPI.getTypeInformation("fighting")).toBe(result);
      expect(spy).toHaveBeenCalledWith(
        "https://pokeapi.co/api/v2/type/fighting/"
      );
    });
  });
});

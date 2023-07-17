import { Component, jsx } from "nano-jsx";
import { useTooltipAdditionsContext } from "./tooltipAdditionsContext";

declare var Dex: Dex;

export default class DamageRelationsDisplay extends Component {
  get damageRelations() {
    return Array.from(
      useTooltipAdditionsContext().damageRelations.entries()
    ).sort((a, b) => b[0] - a[0]);
  }

  getTypeImage(type: string) {
    const element = jsx([Dex.getTypeIcon(type)] as any);
    element.style = "vertical-align: text-bottom;";
    return element;
  }

  render() {
    return (
      <div data-psth-tag="damage-relations">
        {this.damageRelations.map(([multiplier, types]) => {
          return (
            <p data-psth-tag={`damage-relation-x${multiplier}`}>
              <small
                data-psth-tag="damage-relation-text"
                style={{ marginRight: "0.5ch" }}
              >
                x{multiplier}:
              </small>
              {types.map((type) => this.getTypeImage(type))}
            </p>
          );
        })}
      </div>
    );
  }
}

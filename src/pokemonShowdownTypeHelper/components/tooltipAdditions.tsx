import { Component } from "nano-jsx";
import StatDisplay from "./statDisplay";
import DamageRelationsDisplay from "./damageRelationsDisplay";
import context, { TooltipAdditionsContext } from "./tooltipAdditionsContext";

export default class TooltipAdditions extends Component<TooltipAdditionsContext> {
  render() {
    return (
      <>
        <context.Provider value={this.props}>
          <StatDisplay />
          <DamageRelationsDisplay />
        </context.Provider>
      </>
    );
  }
}

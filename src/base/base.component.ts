import { Component, ReactComponent, Require, Utils } from "@amoebajs/builder";
import { ZentCssImportDirective } from "../directives/base-css.directive";

export type IDecide = "||" | "??";

@Component({ name: "component-base", displayName: "Zent基础组件" })
@Require(ZentCssImportDirective, { target: "base" })
export class ZentComponent<T extends Record<string, any> = {}> extends ReactComponent<T> {
  protected getElementStyles(): Record<string, any> {
    return {};
  }

  protected createSyntaxStyles(styles?: Record<string, any>) {
    return `{ ...(${JSON.stringify(styles ?? this.getElementStyles())}), ...${Utils.REACT.Props}.style }`;
  }

  protected useStringProp(prop: string, input: string[] | string | boolean, decide: IDecide = "||"): string {
    let value = "";
    if (Utils.is.array(input)) value = input.join(" ");
    else value = String(input);
    return this.useDefaultProp(prop, `"${value}"`, decide);
  }

  protected useBooleanProp(prop: string, value: boolean | string, decide: IDecide = "||"): string {
    return this.useDefaultProp(prop, String(value) === "true", decide);
  }

  protected useDefaultProp(prop: string, defaultValue: any, decide: IDecide = "||"): string {
    return `props.${prop} ${decide} ${defaultValue}`;
  }

  protected useObjectProp(prop: string, value: Record<string, any>) {
    return `{ ...(${JSON.stringify(value)}), ...props.${prop} }`;
  }

  protected useArrayMap(values: Array<[string, any]>): Record<string, any> {
    return values.reduce((p, c) => ({ ...p, [c[0]]: c[1] }), {});
  }
}

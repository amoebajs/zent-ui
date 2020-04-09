import { Component, Input, Require, Reference, VariableRef } from "@amoebajs/builder";
import { ZentBaseCssDirective } from "../directives/base-css.directive";
import { ZentComponentImportDirective } from "../directives/base-import.directive";
import { ZentComponent } from "../base/base.component";

export enum ZentButtonType {
  Default = "default",
  Primary = "primary",
  Danger = "danger",
  Success = "success",
}

export enum ZentButtonSize {
  Medium = "medium",
  Large = "large",
  Small = "small",
}

export enum ZentButtonHtmlType {
  Button = "button",
  Submit = "submit",
  Reset = "reset",
}

@Component({ name: "button", displayName: "按钮", parent: ZentComponent })
@Require(ZentComponentImportDirective, { target: "button", alias: ({ comp }: any) => comp.name })
@Require(ZentBaseCssDirective, { target: "button" })
export class ZentButtonComponent extends ZentComponent {
  @Input({ name: "className", useEnums: v => typeof v === "string" })
  ztClassName: string[] = [];

  @Input({ name: "style", useMap: { key: "string", value: "string" } })
  ztStyle: Array<[string, string]> = [];

  @Input({ name: "type" })
  ztType: ZentButtonType = ZentButtonType.Default;

  @Input({ name: "size" })
  ztSize: ZentButtonSize = ZentButtonSize.Medium;

  @Input({ name: "block" })
  ztBlock: boolean = false;

  @Input({ name: "outline" })
  ztOutline: boolean = false;

  @Input({ name: "bordered" })
  ztBordered: boolean = true;

  @Input({ name: "disabled" })
  ztDisabled: boolean = false;

  @Input({ name: "loading" })
  ztLoading: boolean = false;

  @Input({ name: "htmltype" })
  ztHtmlType: ZentButtonHtmlType = ZentButtonHtmlType.Button;

  @Reference("button")
  protected comp!: VariableRef;

  protected async onInit() {
    await super.onInit();
    this.setTagName(this.comp.name);
    const styles = this.useArrayMap(this.ztStyle);
    this.addAttributesWithSyntaxMap({
      // 覆盖zent按钮的组合样式
      style: this.useObjectProp("style", { marginLeft: 0, ...styles }),
      className: this.useStringProp("className", this.ztClassName),
      type: this.useStringProp("type", this.ztType),
      size: this.useStringProp("size", this.ztSize),
      htmlType: this.useStringProp("htmlType", this.ztHtmlType),
      block: this.useBooleanProp("block", this.ztBlock),
      disabled: this.useBooleanProp("disabled", this.ztDisabled),
      loading: this.useBooleanProp("loading", this.ztLoading),
      outline: this.useBooleanProp("outline", this.ztOutline),
      bordered: this.useBooleanProp("bordered", this.ztBordered),
      target: this.useStringProp("target", ""),
      href: "props.href",
      download: "props.download",
      onClick: "props.onClick",
    });
    this.addRenderPushedChild(this.createNode("jsx-expression").setExpression("props.children"));
  }
}

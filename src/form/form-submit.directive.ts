import { Directive, Reference, Input, VariableRef, EntityVariableRef, Utils } from "@amoebajs/builder";
import { ZentDirective } from "../base/base.directive";
import { IUniversalFormState } from "./form.component";

export enum FormSubmitType {
  Console = "console",
  Ajax = "ajax",
}

@Directive({
  name: "universal-form-submit",
  displayName: "表单提交",
  parent: ZentDirective,
})
export class UniversalFormSubmit extends ZentDirective<IUniversalFormState> {
  @Reference("button")
  protected formSubmitButton!: VariableRef;

  @Reference("group")
  protected formSubmitGroupId!: VariableRef;

  @Reference("submit")
  protected formSubmitId!: VariableRef;

  @Reference("cancel")
  protected formCancelId!: VariableRef;

  @Input({ name: "type", required: true, useEnums: Utils.getEnumValues(FormSubmitType) })
  public formSubmitType: FormSubmitType = FormSubmitType.Console;

  @Input({ name: "showCancel" })
  public formShowCancel!: boolean;

  @Input({ name: "submitText" })
  public formSubmitText!: string;

  @Input({ name: "cancelText" })
  public formCancelText!: string;

  @Input({ useRef: "observable" })
  public filters!: EntityVariableRef;

  @Reference("click-fn")
  protected filterOnClick!: VariableRef;

  protected get nextFn() {
    return this.render.component.getNamedObserver(this.filters.name, "next");
  }

  protected async onAttach() {
    const refname = this.render.component.getState("formRefname");
    const childset = this.render.component.getState("formFields");
    const group = this.createNode("jsx-element")
      .setTagName(Utils.DOMS.Div)
      .addJsxAttrs({ key: `"${this.formSubmitGroupId.name}"` });
    group.addJsxAttr("style", JSON.stringify({ paddingTop: "24px", paddingLeft: "60px" }));
    group.addJsxChild(this.createConfirm(refname));
    if (this.formShowCancel) {
      group.addJsxChild(this.createCancel());
    }
    childset[this.formSubmitGroupId.name] = {
      id: this.formSubmitGroupId,
      type: "submit",
      extends: {},
      generate: () => group,
    };
    this.addImports([
      this.helper.createImport("zent/es/button", this.formSubmitButton.name),
      this.helper.createImport("zent/css/button.css"),
    ]);
  }

  private createCancel() {
    const cancel = this.createNode("jsx-element")
      .setTagName(this.formSubmitButton.name)
      .addJsxAttrs({
        key: `"${this.formCancelId.name}"`,
        type: `"${"default"}"`,
      });
    cancel.addJsxAttr("onClick", `() => ${this.nextFn}({})`);
    cancel.addJsxChild(this.formCancelText ?? "取消");
    return cancel;
  }

  private createConfirm(refname: string) {
    const confirm = this.createNode("jsx-element")
      .setTagName(this.formSubmitButton.name)
      .addJsxAttrs({
        key: `"${this.formSubmitId.name}"`,
        type: `"${"primary"}"`,
      });
    if (this.formSubmitType === FormSubmitType.Console) {
      // confirm.addJsxAttr("onClick", `() => console.log(${refname}.getValue())`);
      confirm.addJsxAttr("onClick", `() => ${this.nextFn}(${refname}.getValue())`);
    } else if (this.formSubmitType === FormSubmitType.Ajax) {
      // TODO
      confirm.addJsxAttr("onClick", `() => console.log("TO DO")`);
    }
    confirm.addJsxChild(this.formSubmitText ?? "确认");
    return confirm;
  }
}

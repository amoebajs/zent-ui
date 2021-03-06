import {
  Component,
  Require,
  Reference,
  Input,
  VariableRef,
  IAfterInit,
  IAfterDirectivesAttach,
  Utils,
} from "@amoebajs/builder";
import { ZentCssImportDirective } from "../directives/base-css.directive";
import { ZentComponent } from "../base/base.component";
import { ZentComponentImportDirective } from "../directives/base-import.directive";
import { IUniversalFormField } from "./form-field.directive";

export interface IUniversalFormState {
  formRefname: string;
  formFields: Record<string, IUniversalFormField>;
}

export enum FormDirection {
  Horizontal = "horizontal",
  Vertical = "vertical",
}

@Component({
  name: "universal-form",
  displayName: "表单",
  parent: ZentComponent,
})
@Require(ZentCssImportDirective, { target: "form" })
@Require(ZentComponentImportDirective, {
  target: "form",
  named: ({ formStrategy, formRoot }: UniversalForm) => ({
    Form: formRoot.name,
    FormStrategy: formStrategy.name,
  }),
})
export class UniversalForm<T extends IUniversalFormState = IUniversalFormState> extends ZentComponent<T>
  implements IAfterInit, IAfterDirectivesAttach {
  @Reference("form")
  protected formRoot!: VariableRef;

  @Reference("form-strategy")
  protected formStrategy!: VariableRef;

  @Reference("form-refname")
  protected formRefname!: VariableRef;

  @Input({ name: "direction", useEnums: Utils.getEnumValues(FormDirection) })
  public formDirection: FormDirection = FormDirection.Horizontal;

  public afterInit() {
    this.setTagName(this.formRoot.name);
    this.setState("formFields", {});
    this.setState("formRefname", this.formRefname.name);
    this.addAttributeWithSyntaxText("form", this.formRefname);
    this.addAttributeWithSyntaxText("layout", `"${this.formDirection}"`);
    this.addAttributeWithSyntaxText("style", this.createSyntaxStyles());
    this.addUnshiftVariable(this.formRefname, this.createRefExpression());
  }

  private createRefExpression() {
    const strategy = `${this.formRoot.name}.useForm<any, any, any>(${this.formStrategy.name}.View)`;
    return this.helper.__engine.createIdentifier(strategy);
  }

  public afterDirectivesAttach() {
    super.afterDirectivesAttach();
    this.beforeFormChildrenToRender(this.render.component.getState("formFields"));
  }

  protected beforeFormChildrenToRender(set: T["formFields"]) {
    const entries = Object.entries(set);
    for (const [key, entry] of entries) {
      this.addRenderChildren(key, <any>entry.generate(entry.extends));
    }
  }
}

import {
  Directive,
  Input,
  Reference,
  VariableRef,
  JsxElementGenerator,
  JsxExpressionGenerator,
  Utils,
} from "@amoebajs/builder";
import { ZentDirective } from "../base/base.directive";
import { IUniversalFormState } from "./form.component";

export enum FormFieldType {
  Text = "text",
  Number = "number",
  Textarea = "textarea",
  Select = "select",
  Switch = "switch",
  Checkbox = "checkbox",
}

export interface IUniversalFormField {
  id: VariableRef;
  element: JsxElementGenerator | JsxExpressionGenerator;
}

@Directive({
  name: "universal-form-field",
  displayName: "通用表单字段",
  parent: ZentDirective,
})
export class UniversalFormField extends ZentDirective<IUniversalFormState> {
  @Reference("form-field-id")
  protected formFieldUniqueId!: VariableRef;

  @Reference("text-input")
  protected formFieldTextInput!: VariableRef;

  @Reference("textarea-input")
  protected formFieldTextareaInput!: VariableRef;

  @Reference("number-input")
  protected formFieldNumberInput!: VariableRef;

  @Reference("switch")
  protected formFieldSwitch!: VariableRef;

  @Reference("select")
  protected formFieldSelect!: VariableRef;

  @Reference("select-option")
  protected formFieldSelectOption!: VariableRef;

  @Reference("checkbox")
  protected formFieldCheckbox!: VariableRef;

  @Reference("checkbox-group")
  protected formFieldCheckboxGroup!: VariableRef;

  @Input({ name: "name", required: true })
  public formFieldName!: string;

  @Input({ name: "label" })
  public formFieldLabel!: string;

  @Input({ name: "type", required: true, useEnums: Utils.getEnumValues(FormFieldType) })
  public formFieldType: FormFieldType = FormFieldType.Text;

  @Input({ name: "placeholder" })
  public formFieldPlaceholder!: string;

  @Input({ name: "required" })
  public formFieldRequired!: boolean;

  // TODO: type define of any
  @Input({ name: "value" })
  public formFieldDefaultValue!: string;

  @Input({ name: "options", useMap: { key: "string", value: "any" } })
  public formFieldOptions: Array<[string, string]> = [];

  protected async onAttach() {
    const set = this.render.getRootState("formFields");
    if (Utils.is.nullOrUndefined(this.formFieldName) || this.formFieldName === "") {
      throw new Error("[universal-form-field] form-field name cannot be empty.");
    }
    const newChild: IUniversalFormField = (set[this.formFieldUniqueId.name] = {
      id: this.formFieldUniqueId,
      element: null as any,
    });
    const element = this.createNode("jsx-element")
      .addJsxAttr("key", `"${this.formFieldUniqueId.name}"`)
      .addJsxAttr("name", `"${this.formFieldName}"`)
      .addJsxAttr("label", `"${this.formFieldLabel ?? this.formFieldName}"`)
      .addJsxAttr("required", `${this.formFieldRequired ?? false}`);
    this.decideGeneration(this.formFieldType, element);
    newChild.element = element;
  }

  private decideGeneration(fieldType: FormFieldType, element: JsxElementGenerator) {
    switch (fieldType) {
      case FormFieldType.Text:
        this.prepareForText(element);
        this.importFormField(element, "FormInputField", this.formFieldTextInput);
        break;
      case FormFieldType.Textarea:
        this.prepareForTextarea(element);
        this.importFormField(element, "FormInputField", this.formFieldTextareaInput);
        break;
      case FormFieldType.Number:
        this.prepareForNumber(element);
        this.importFormField(element, "FormNumberInputField", this.formFieldNumberInput);
        break;
      case FormFieldType.Checkbox:
        this.prepareForCheckbox(element);
        this.importFormField(element, "FormCheckboxGroupField", this.formFieldCheckboxGroup);
        break;
      case FormFieldType.Select:
        this.prepareForSelect(element);
        this.importFormField(element, "FormSelectField", this.formFieldSelect);
        break;
      case FormFieldType.Switch:
        this.prepareForSwitch(element);
        this.importFormField(element, "FormSwitchField", this.formFieldSwitch);
        break;
      default:
        break;
    }
  }

  private prepareForTextarea(element: JsxElementGenerator) {
    this.prepareForText(element, { type: "textarea" });
  }

  private prepareForText(element: JsxElementGenerator, props: Record<string, any> = {}) {
    element
      .setTagName(this.formFieldTextInput.name)
      .addJsxAttr(
        "props",
        JSON.stringify({
          ...props,
          placeholder: this.formFieldPlaceholder ?? "",
          style: { width: "300px" },
        }),
      )
      .addJsxAttr("defaultValue", `"${this.formFieldDefaultValue ?? ""}"`);
  }

  private prepareForSwitch(element: JsxElementGenerator) {
    element
      .setTagName(this.formFieldSwitch.name)
      .addJsxAttr("defaultValue", `${String(this.formFieldDefaultValue) === "true"}`);
  }

  private prepareForNumber(element: JsxElementGenerator, props: Record<string, any> = {}) {
    element
      .setTagName(this.formFieldNumberInput.name)
      .addJsxAttr(
        "props",
        JSON.stringify({
          ...props,
          placeholder: this.formFieldPlaceholder ?? "",
          style: { width: "300px" },
        }),
      )
      .addJsxAttr("defaultValue", `${this.formFieldDefaultValue ?? 0}`);
  }

  private prepareForCheckbox(element: JsxElementGenerator, props: Record<string, any> = {}) {
    const values = Utils.is.array(this.formFieldDefaultValue)
      ? this.formFieldDefaultValue
      : [this.formFieldDefaultValue];
    element
      .setTagName(this.formFieldCheckboxGroup.name)
      .addJsxAttr("props", JSON.stringify(props))
      .addJsxChildren(
        this.formFieldOptions.map(([k, v]) =>
          this.createNode("jsx-element")
            .setTagName(this.formFieldCheckbox.name)
            .addJsxAttrs({
              value: `"${v}"`,
            })
            .addJsxChild(k),
        ),
      )
      .addJsxAttr(
        "defaultValue",
        `[${values
          .filter(e => this.formFieldOptions.findIndex(b => b[1] === e) >= 0)
          .map(i => `"${i}"`)
          .join(", ")}]`,
      );
  }

  private prepareForSelect(element: JsxElementGenerator, props: Record<string, any> = {}) {
    element
      .setTagName(this.formFieldSelect.name)
      .addJsxAttr(
        "props",
        JSON.stringify({
          ...props,
          placeholder: this.formFieldPlaceholder ?? "",
          data: this.formFieldOptions.map(([k, v]) => ({ text: k, value: v })),
        }),
      )
      .addJsxAttr("defaultValue", `"${this.formFieldDefaultValue}"`);
  }

  private importFormField(element: JsxElementGenerator, name: string, id: VariableRef) {
    element.setTagName(id.name);
    const imports = [this.helper.createImport("zent/es/form", undefined, [[name, id.name]])];
    switch (name) {
      case "FormInputField":
      case "FormNumberInputField":
        imports.push(this.helper.createImport("zent/css/input.css"));
        break;
      case "FormCheckboxGroupField":
        imports.push(this.helper.createImport("zent/es/checkbox", this.formFieldCheckbox.name));
        imports.push(this.helper.createImport("zent/css/checkbox.css"));
        break;
      case "FormSelectField":
        imports.push(this.helper.createImport("zent/css/select.css"));
        break;
      case "FormSwitchField":
        imports.push(this.helper.createImport("zent/css/switch.css"));
        break;
      default:
        break;
    }
    this.addImports(imports);
  }
}

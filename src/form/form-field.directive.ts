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

export interface IGenerateExtends {
  style?: Record<string, any>;
}

export interface IUniversalFormField {
  id: VariableRef;
  type: "submit" | "field";
  extends: IGenerateExtends;
  generate: (ext?: IGenerateExtends) => JsxElementGenerator | JsxExpressionGenerator;
}

@Directive({
  name: "universal-form-field",
  displayName: "表单字段",
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
    const set = this.render.component.getState("formFields");
    if (Utils.is.nullOrUndefined(this.formFieldName) || this.formFieldName === "") {
      throw new Error("[universal-form-field] form-field name cannot be empty.");
    }
    set[this.formFieldUniqueId.name] = {
      id: this.formFieldUniqueId,
      type: "field",
      extends: {},
      generate: this.decideGeneration(
        this.formFieldType,
        this.createNode("jsx-element")
          .addJsxAttr("key", `"${this.formFieldUniqueId.name}"`)
          .addJsxAttr("name", `"${this.formFieldName}"`)
          .addJsxAttr("label", `"${this.formFieldLabel ?? this.formFieldName}"`)
          .addJsxAttr("required", `${this.formFieldRequired ?? false}`),
      ),
    };
  }

  private decideGeneration(fieldType: FormFieldType, element: JsxElementGenerator) {
    switch (fieldType) {
      case FormFieldType.Text:
        this.importFormField(element, "FormInputField", this.formFieldTextInput);
        return this.prepareForText(element);
      case FormFieldType.Textarea:
        this.importFormField(element, "FormInputField", this.formFieldTextareaInput);
        return this.prepareForTextarea(element);
      case FormFieldType.Number:
        this.importFormField(element, "FormNumberInputField", this.formFieldNumberInput);
        return this.prepareForNumber(element);
      case FormFieldType.Checkbox:
        this.importFormField(element, "FormCheckboxGroupField", this.formFieldCheckboxGroup);
        return this.prepareForCheckbox(element);
      case FormFieldType.Select:
        this.importFormField(element, "FormSelectField", this.formFieldSelect);
        return this.prepareForSelect(element);
      case FormFieldType.Switch:
        this.importFormField(element, "FormSwitchField", this.formFieldSwitch);
        return this.prepareForSwitch(element);
      default:
        return () => element;
    }
  }

  private useGenExtends(
    element: JsxElementGenerator,
    transform: (e: JsxElementGenerator) => JsxElementGenerator | JsxExpressionGenerator,
  ) {
    return ({ style }: IGenerateExtends = {}) => {
      if (style) {
        element.addJsxAttr("style", JSON.stringify(style));
      }
      return transform(element);
    };
  }

  private prepareForTextarea(element: JsxElementGenerator) {
    return this.prepareForText(element, this.formFieldTextareaInput, { type: "textarea" });
  }

  private prepareForText(element: JsxElementGenerator, ref = this.formFieldTextInput, props: Record<string, any> = {}) {
    return this.useGenExtends(element, element =>
      element
        .setTagName(ref.name)
        .addJsxAttr(
          "props",
          JSON.stringify({
            ...props,
            placeholder: this.formFieldPlaceholder ?? "",
            style: { width: "300px" },
          }),
        )
        .addJsxAttr("defaultValue", `"${this.formFieldDefaultValue ?? ""}"`),
    );
  }

  private prepareForSwitch(element: JsxElementGenerator) {
    return this.useGenExtends(element, element =>
      element
        .setTagName(this.formFieldSwitch.name)
        .addJsxAttr("defaultValue", `${String(this.formFieldDefaultValue) === "true"}`),
    );
  }

  private prepareForNumber(element: JsxElementGenerator, props: Record<string, any> = {}) {
    return this.useGenExtends(element, element =>
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
        .addJsxAttr("defaultValue", `${this.formFieldDefaultValue ?? 0}`),
    );
  }

  private prepareForCheckbox(element: JsxElementGenerator, props: Record<string, any> = {}) {
    return this.useGenExtends(element, element => {
      const values = Utils.is.array(this.formFieldDefaultValue)
        ? this.formFieldDefaultValue
        : [this.formFieldDefaultValue];
      return element
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
    });
  }

  private prepareForSelect(element: JsxElementGenerator, props: Record<string, any> = {}) {
    return this.useGenExtends(element, element =>
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
        .addJsxAttr("defaultValue", `"${this.formFieldDefaultValue}"`),
    );
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

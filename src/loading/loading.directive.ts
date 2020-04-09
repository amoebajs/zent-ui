import { Directive, Input, Reference, VariableRef } from "@amoebajs/builder";
import { ZentDirective } from "../base/base.directive";

@Directive({
  name: "loading",
  displayName: "Loading指令",
  parent: ZentDirective,
})
export class ZentLoadingDirective extends ZentDirective {
  @Input({ name: "name" })
  public stateName: string = "loading";

  @Input({ name: "expression" })
  public expression!: string;

  @Reference("block-loading")
  protected comp!: VariableRef;

  protected async onAttach() {
    await super.onAttach();
    this.addImports([
      this.helper.createImport("zent/es/loading/BlockLoading", this.comp.name),
      this.helper.createImport("zent/css/loading.css"),
    ]);
    this.render.appendRootEleChangeFns(pageRoot =>
      this.createNode("jsx-element")
        .setTagName(this.comp.name)
        .addJsxAttr("loading", this.expression ?? this.render.createStateAccessSyntax(this.stateName))
        .addJsxChildren([pageRoot]),
    );
  }
}

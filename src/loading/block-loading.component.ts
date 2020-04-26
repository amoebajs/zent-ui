import { Component, Require, Input, Attach, PropAttach, IAfterInit, Reference, VariableRef } from "@amoebajs/builder";
import { EntityStateDirective } from "@amoebajs/basic-modules";
import { ZentComponentImportDirective } from "../directives/base-import.directive";
import { ZentCssImportDirective } from "../directives/base-css.directive";
import { ZentComponent } from "../base/base.component";

@Component({
  name: "loading",
  displayName: "加载布局",
  parent: ZentComponent,
})
@Require(ZentCssImportDirective, { target: "loading" })
@Require(ZentComponentImportDirective, {
  target: "loading/block-loading",
  alias: ({ formElement }: ZentLoadingComponent) => formElement.name,
})
@Require(EntityStateDirective, {
  name: "AppContext",
  state: ({ stateName }: ZentLoadingComponent) => [[stateName, false]],
})
export class ZentLoadingComponent extends ZentComponent implements IAfterInit {
  @Input({ name: "loading" })
  public stateName: string = "loading";

  @Attach({ name: "display" })
  public displayWith: PropAttach<string> = new PropAttach();

  @Reference("block-loading")
  protected formElement!: VariableRef;

  public afterInit() {
    this.setTagName(this.formElement.name);
  }

  public afterChildrenRender() {
    super.afterChildrenRender();
    this.addAttributeWithSyntaxText("loading", this.render.component.createStateAccessSyntax(this.stateName));
  }

  protected onChildrenVisit(key: string) {
    const displayWith = this.displayWith.get(key);
    if (!displayWith || displayWith === "") {
      return;
    }
    return {
      newDisplayRule: this.render.component.createStateAccessSyntax(displayWith),
    };
  }
}

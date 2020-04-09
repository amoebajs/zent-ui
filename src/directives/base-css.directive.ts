import { Directive, Input } from "@amoebajs/builder";
import { ZentDirective } from "../base/base.directive";

@Directive({
  name: "base-css",
  displayName: "基础样式指令",
  parent: ZentDirective,
})
export class ZentBaseCssDirective extends ZentDirective {
  @Input()
  public target: string = "base";

  protected async onAttach() {
    try {
      this.addImports([this.createNode("import").setModulePath(`zent/css/${this.target}.css`)]);
      if (this.target !== "base") {
        this.addImports([this.createNode("import").setModulePath(`zent/css/base.css`)]);
      }
    } catch (error) {
      /** ignore */
    }
  }
}

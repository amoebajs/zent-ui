import { Directive, Input, Utils } from "@amoebajs/builder";
import { ZentDirective } from "../base/base.directive";

@Directive({
  name: "css-import",
  displayName: "样式导入",
  parent: ZentDirective,
})
export class ZentCssImportDirective extends ZentDirective {
  @Input()
  public target: string | string[] = "base";

  protected async onAttach() {
    try {
      if (!Utils.is.array(this.target)) {
        this.target = [this.target].filter(i => !!i);
      }
      if (!this.target.includes("base")) {
        this.target.unshift("base");
      }
      for (const each of this.target) {
        this.addImports([this.createNode("import").setModulePath(`zent/css/${each}.css`)]);
      }
    } catch (error) {
      /** ignore */
    }
  }
}

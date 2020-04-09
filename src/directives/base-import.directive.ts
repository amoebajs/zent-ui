import { Directive, Input, Utils } from "@amoebajs/builder";
import { ZentDirective } from "../base/base.directive";

@Directive({
  name: "component-import",
  displayName: "组件导入指令",
  parent: ZentDirective,
})
export class ZentComponentImportDirective extends ZentDirective {
  @Input()
  public target!: string;

  @Input()
  public alias!: string;

  @Input()
  public named!: Record<string, string>;

  protected async onAttach() {
    try {
      if (this.named) {
        const entries = Object.entries(this.named);
        for (const [target, alias] of entries) {
          this.createNamedImport(this.target, target, alias);
        }
      } else {
        this.createDefaultImport(this.target, this.alias || this.target);
      }
    } catch (error) {
      /** ignore */
    }
  }

  private createDefaultImport(target: string, alias: string) {
    let pathname = target || "";
    let compname = alias || "";
    const useAlias = alias !== target;
    const lidx = pathname.lastIndexOf("/");
    if (lidx > 0) {
      const value = pathname.slice(lidx);
      const entiname = Utils.classCase(value);
      pathname = pathname.slice(0, lidx) + "/" + entiname;
      compname = useAlias ? alias : entiname;
    }
    this.addImports([this.helper.createImport("zent/es/" + pathname, compname)]);
  }

  private createNamedImport(target: string, name: string, alias?: string) {
    let pathname = target || "";
    const lidx = pathname.lastIndexOf("/");
    if (lidx > 0) {
      const value = pathname.slice(lidx);
      const entiname = Utils.classCase(value);
      pathname = pathname.slice(0, lidx) + "/" + entiname;
    }
    this.addImports([this.helper.createImport("zent/es/" + pathname, undefined, [!alias ? name : [name, alias]])]);
  }
}

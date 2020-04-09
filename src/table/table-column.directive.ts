import { Directive, Input, Reference, VariableRef, Utils } from "@amoebajs/builder";
import { ZentDirective } from "../base/base.directive";
import { IUniversalTable, TableColumnMode } from "./typing";

@Directive({
  name: "universal-table-column",
  displayName: "通用表格列",
  parent: ZentDirective,
})
export class UniversalTableColumn extends ZentDirective<IUniversalTable> {
  @Reference("table-column-id")
  protected tcId!: VariableRef;

  @Input({ name: "title" })
  public tcTitle!: string;

  @Input({ name: "name" })
  public tcName!: string;

  @Input({ name: "width" })
  public tcWidth!: string;

  @Input({ name: "mode", useEnums: Utils.getEnumValues(TableColumnMode) })
  public tcMode: TableColumnMode = TableColumnMode.Normal;

  protected async onAttach() {
    const set = this.render.getRootState("tableColumns");
    if (Utils.is.nullOrUndefined(this.tcTitle) || this.tcTitle === "") {
      throw new Error("[universal-table-column] table-column title cannot be empty.");
    }
    set.push({
      id: this.tcId,
      name: this.normalizeKV("name", this.tcName),
      title: this.normalizeKV("title", this.tcTitle)!,
      width: this.normalizeKV("width", this.tcWidth),
      fixed: this.tcMode,
    });
  }

  protected normalizeKV(name: string, value: any): string | undefined {
    switch (name) {
      case "width":
        return Utils.is.nullOrUndefined(value) ? void 0 : Number.isNaN(+value) ? `"${value}"` : String(value);
      case "name":
      case "title":
      default:
        return `"${value}"`;
    }
  }
}

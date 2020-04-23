import {
  Component,
  Require,
  Reference,
  VariableRef,
  IAfterInit,
  IAfterDirectivesAttach,
  Utils,
  Input,
  BasicState,
} from "@amoebajs/builder";
import { HttpCallDirective } from "@amoebajs/basic-modules";
import { ZentBaseCssDirective } from "../directives/base-css.directive";
import { ZentComponent } from "../base/base.component";
import { ZentComponentImportDirective } from "../directives/base-import.directive";
import { IUniversalTable, IUniversalTableColumn, TableColumnMode } from "./typing";
import { ZentLoadingDirective } from "../loading/loading.directive";

@Component({
  name: "universal-table",
  displayName: "通用表格",
  parent: ZentComponent,
})
@Require(ZentBaseCssDirective, { target: "grid" })
@Require(ZentComponentImportDirective, {
  target: "grid",
  alias: (i: UniversalTable) => i.tableRoot.name,
})
@Require(ZentLoadingDirective, "Loading", {
  expression: (i: UniversalTable) => i.tableLoading,
})
@Require(HttpCallDirective, "HttpCall")
export class UniversalTable extends ZentComponent<IUniversalTable> implements IAfterInit, IAfterDirectivesAttach {
  @Reference("table")
  protected tableRoot!: VariableRef;

  @Reference("table-data")
  protected tableDataVar!: VariableRef;

  @Reference("table-columns")
  protected tableColumnsVar!: VariableRef;

  @Reference("table-change-callback")
  protected tableChangeCallback!: VariableRef;

  @Input({ name: "autoLoading" })
  public tableAutoLoading: boolean = true;

  @Input({ name: "stateName" })
  public tableStateName: string = "dataset";

  @Input({ name: "fetchUrl", required: true })
  public tableFetchUrl!: string;

  private _datasetName = "dataset";
  private _paginationName = "pagination";

  protected get tableLoading() {
    return this.tableAutoLoading ? "!" + this.datasetName : false;
  }

  protected get dataSyntaxPath() {
    return this.render.component.createStateAccessSyntax(this.tableStateName);
  }

  protected get datasetName() {
    return this.tableDataVar.name + "." + this._datasetName;
  }

  protected get paginationName() {
    return this.tableDataVar.name + "." + this._paginationName;
  }

  public afterInit() {
    this.setState("tableColumns", []);
    this.setTagName(this.tableRoot.name);
    this.addAttributeWithSyntaxText("columns", this.tableColumnsVar.name);
    this.addAttributeWithSyntaxText("datasets", this.datasetName);
    this.addAttributeWithSyntaxText("onChange", this.tableChangeCallback.name);
    this.addUnshiftVariable(this.tableDataVar.name, this.helper.__engine.createIdentifier(this.dataSyntaxPath));
    this.createChangeCallback();
  }

  private createChangeCallback() {
    const axiosFn = this.render.component.createDirectiveRefAccess("HttpCall", "request-name");
    const contextName = this.getState(BasicState.ContextInfo).name;
    const expression = this.helper.useComplexLogicExpression(
      {
        type: "complexLogic",
        expression: {
          vars: [`setState is $(${this.tableStateName} | bind:setState)`],
          expressions: [
            "try {",
            // `let promise = Promise.resolve({ items: [], pagination: { current: current + 1, pageSize, total: 200 } });`,
            `const { items, pagination } = await ${axiosFn}({ url: \`${this.unionQueryWithFetchApi()}\`});`,
            "console.log(items);",
            "console.log(pagination);",
            `setState({ dataset: items || [], pagination: { ...pagination } });`,
            "} catch(error) { console.log(error); }",
          ],
        },
      },
      contextName,
    );
    this.addUseCallback(this.tableChangeCallback.name, `async ({current, pageSize}: any) => { ${expression} }`, [
      this.tableDataVar.name,
    ]);
  }

  private unionQueryWithFetchApi() {
    const fetchUrl = this.tableFetchUrl ?? "";
    return `${fetchUrl}${fetchUrl.indexOf("?") < 0 ? "?" : "&"}current=\${current}&pageSize=\${pageSize}`;
  }

  public afterDirectivesAttach() {
    const columns = this.getState("tableColumns");
    const newColumns = this.resortColumns(columns);
    this.addUnshiftVariable(
      this.tableColumnsVar.name,
      this.helper.__engine.createIdentifier(`[${newColumns.map(i => this.useEachColumn(i)).join(", ")}]`),
    );
  }

  private resortColumns(columns: IUniversalTableColumn[]) {
    const fixeds = columns.filter(i => i.fixed !== TableColumnMode.Normal);
    const x = this.getColumnsScrollX(columns);
    if (fixeds.length > 0 || x > 1000) {
      this.addAttributeWithSyntaxText("scroll", JSON.stringify({ x: x > 1000 ? 1000 : x }));
    }
    const newColumns = columns.filter(i => i.fixed === TableColumnMode.Normal);
    newColumns.unshift(...fixeds.filter(i => i.fixed === TableColumnMode.Left));
    newColumns.push(...fixeds.filter(i => i.fixed === TableColumnMode.Right));
    return newColumns;
  }

  private getColumnsScrollX(columns: IUniversalTableColumn[]) {
    let x = 0;
    for (const { width } of columns) {
      if (Utils.is.nullOrUndefined(width)) {
        x += 240;
        continue;
      }
      if (!Number.isNaN(+width)) {
        x += +width;
        continue;
      }
      if (String(width).endsWith("px")) {
        x += +width.slice(0, width.length - 2);
        continue;
      }
    }
    return x;
  }

  private useEachColumn(i: IUniversalTableColumn) {
    const { id: _, ...others } = i;
    this.useFixed(others);
    return `{ ${Object.entries(others)
      .filter(([, v]) => !Utils.is.nullOrUndefined(v))
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ")} }`;
  }

  private useFixed(i: Omit<IUniversalTableColumn, "id">) {
    if (i.fixed !== TableColumnMode.Normal) {
      i.textAlign = <any>`"${i.fixed}"`;
      i.fixed = <any>`"${i.fixed}"`;
    } else {
      delete i.fixed;
    }
  }
}

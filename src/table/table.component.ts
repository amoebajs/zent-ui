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
  Observable,
  Observer,
} from "@amoebajs/builder";
import { HttpCallDirective } from "@amoebajs/basic-modules";
import { ZentCssImportDirective } from "../directives/base-css.directive";
import { ZentComponent } from "../base/base.component";
import { ZentComponentImportDirective } from "../directives/base-import.directive";
import { IUniversalTable, IUniversalTableColumn, TableColumnMode } from "./typing";
import { ZentLoadingDirective } from "../loading/loading.directive";

@Component({
  name: "universal-table",
  displayName: "表格",
  parent: ZentComponent,
})
@Require(ZentCssImportDirective, {
  target: ["button", "input", "grid", "notify", "pagination"],
})
@Require(ZentComponentImportDirective, {
  target: "grid",
  alias: (i: UniversalTable) => i._table.name,
})
@Require(ZentComponentImportDirective, {
  target: "notify",
  alias: (i: UniversalTable) => i._notify.name,
})
@Require(ZentLoadingDirective, "Loading", {
  expression: (i: UniversalTable) => i.tableLoading,
})
@Require(HttpCallDirective, "AJAX")
export class UniversalTable extends ZentComponent<IUniversalTable> implements IAfterInit, IAfterDirectivesAttach {
  @Reference("table")
  protected _table!: VariableRef;

  @Reference("notify")
  protected _notify!: VariableRef;

  @Reference("data")
  protected _data!: VariableRef;

  @Reference("columns")
  protected _columns!: VariableRef;

  @Reference("change-fn")
  protected _change_fn!: VariableRef;

  @Reference("change-cb")
  protected _change_cb!: VariableRef;

  @Input({ name: "autoLoading" })
  public tableAutoLoading: boolean = true;

  @Input({ name: "stateName" })
  public tableStateName: string = "dataset";

  @Input({ name: "fetchUrl", required: true })
  public tableFetchUrl!: string;

  @Input({ name: "rowKey" })
  public tableRowKey?: string;

  @Observable("effect")
  protected $effect = Observer.Create({
    loading: true,
    dataset: [],
    filters: {},
    pagination: {
      current: 0,
      pageSize: 10,
      total: 0,
    },
  });

  protected get dataCurrent() {
    return this._data.name;
  }

  protected get tableLoading() {
    return this.tableAutoLoading ? this.dataCurrent + ".loading" : false;
  }

  protected get datasetName() {
    return this.dataCurrent + ".dataset";
  }

  protected get paginationName() {
    return this.dataCurrent + ".pagination";
  }

  protected get axiosFn() {
    return this.render.component.createEntityRefAccess("AJAX", "request-name");
  }

  protected get setStateFn() {
    return this.getSetState(this._data.name);
  }

  protected createUpdateState(payload: string | Record<string, any>) {
    return `${this.setStateFn}({ ...${this.dataCurrent}, ...(${
      typeof payload === "string" ? payload : JSON.stringify(payload)
    }) });`;
  }

  public afterInit() {
    super.afterInit();
    this.createContext();
    this.createRootElement();
    this.createElementProps();
    this.createObservables();
    this.createOnChanged();
  }

  private createObservables() {
    this.addUseState(this._data.name, this.getNamedObserver(this.$effect.name, "data"));
    // this.addUseRef(this.tableDataVar, this.getNamedObserver(this.tableDataContext.name, "data"));
  }

  private createRootElement() {
    this.setTagName(this._table.name);
  }

  private createContext() {
    this.setState("tableColumns", []);
  }

  private createElementProps() {
    this.addAttributeWithSyntaxText("columns", this._columns);
    this.addAttributeWithSyntaxText("datasets", this.datasetName);
    this.addAttributeWithSyntaxText("pageInfo", this.paginationName);
    this.addAttributeWithSyntaxText("onChange", this._change_cb);
  }

  private createOnChanged() {
    const contextName = this.getState(BasicState.ContextInfo).name;
    const expression = this.helper.useComplexLogicExpression(
      {
        expressions: [
          `
          try {
            ${this.createUpdateState(`{ loading: true, filters: filters ?? {} }`)}
            const filterChanged = Object.keys(filters ?? {}).length > 0 && Object.entries(filters ?? {}).some(([k, v]) => ${
              this.dataCurrent
            }.filters[k] === v);
            if (filterChanged) current = 1;
            // throw new Error("developing...");
            // region: mock
            const list = [];
            for (let i = 0; i < pageSize; i++) {
              list.push({ field01: "aaa" + i, field02: "bbb" + i, field03: current, field04: current * pageSize });
            }
            const { items, pagination } = await Promise.resolve({ items: list, pagination: { current, pageSize, total: 200 } });
            // endregion
            // const queries = Object.entries({ ...filters, current, pageSize }).map(([k, v]) => \`\${k}=\${encodeURIComponent(v as string)}\`).join("&");
            // const { items, pagination } = await ${
              this.axiosFn
            }({ url: \`${this.unionQueryWithFetchApi()}\${queries}\`});
            console.log(items);
            console.log(pagination);
            ${this.createUpdateState("{ loading: false, dataset: items || [], pagination: { ...pagination } }")}
          } catch (error) {
            ${this._notify.name}.error(String(error));
          }
          `,
        ],
      },
      contextName,
    );
    this.addUnshiftVariable(
      this._change_fn,
      this.helper.createSyntaxExpression(`async ({ current, pageSize }: any, filters: any = {}) => { ${expression} }`),
    );
    this.addUseObservables(
      this.$effect,
      `({ pagination, filters }: any) => ${this._change_fn.name}(pagination, filters)`,
      void 0,
      [this._data],
    );
    this.addUseCallback(this._change_cb, this._change_fn, [this._data]);
  }

  private unionQueryWithFetchApi() {
    const fetchUrl = this.tableFetchUrl ?? "";
    return `${fetchUrl}${fetchUrl.indexOf("?") < 0 ? "?" : "&"}`;
  }

  public afterDirectivesAttach() {
    const columns = this.getState("tableColumns");
    const newColumns = this.resortColumns(columns);
    this.addAttributeWithSyntaxText("rowKey", !!this.tableRowKey ? `"${this.tableRowKey}"` : columns[0].name ?? '"id"');
    this.addUnshiftVariable(
      this._columns.name,
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

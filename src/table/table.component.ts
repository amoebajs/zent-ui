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
  alias: (i: UniversalTable) => i.tableRoot.name,
})
@Require(ZentComponentImportDirective, {
  target: "notify",
  alias: (i: UniversalTable) => i.tableNotify.name,
})
@Require(ZentLoadingDirective, "Loading", {
  expression: (i: UniversalTable) => i.tableLoading,
})
@Require(HttpCallDirective, "HttpCall")
export class UniversalTable extends ZentComponent<IUniversalTable> implements IAfterInit, IAfterDirectivesAttach {
  @Reference("table")
  protected tableRoot!: VariableRef;

  @Reference("notify")
  protected tableNotify!: VariableRef;

  @Reference("data")
  protected tableDataVar!: VariableRef;

  @Reference("columns")
  protected tableColumnsVar!: VariableRef;

  @Reference("change-fn")
  protected tableChangeFn!: VariableRef;

  @Reference("change-cb")
  protected tableChangeCallback!: VariableRef;

  @Input({ name: "autoLoading" })
  public tableAutoLoading: boolean = true;

  @Input({ name: "stateName" })
  public tableStateName: string = "dataset";

  @Input({ name: "fetchUrl", required: true })
  public tableFetchUrl!: string;

  @Observable("data-effect")
  protected tableDataContext = Observer.Create({
    loading: true,
    dataset: [],
    pagination: {
      current: 0,
      pageSize: 10,
      total: 0,
    },
  });

  protected get tableLoading() {
    return this.tableAutoLoading ? this.tableDataVar.name + ".loading" : false;
  }

  protected get datasetName() {
    return this.tableDataVar.name + ".dataset";
  }

  protected get paginationName() {
    return this.tableDataVar.name + ".pagination";
  }

  protected get axiosFn() {
    return this.render.component.createEntityRefAccess("HttpCall", "request-name");
  }

  protected get setStateFn() {
    return this.getSetState(this.tableDataVar.name);
  }

  protected get currentState() {
    return this.tableDataVar.name;
  }

  protected createUpdateState(payload: string | Record<string, any>) {
    return `${this.setStateFn}({ ...${this.currentState}, ...(${
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
    this.addUseState(this.tableDataVar.name, this.getNamedObserver(this.tableDataContext.name, "data"));
  }

  private createRootElement() {
    this.setTagName(this.tableRoot.name);
  }

  private createContext() {
    this.setState("tableColumns", []);
  }

  private createElementProps() {
    this.addAttributeWithSyntaxText("columns", this.tableColumnsVar);
    this.addAttributeWithSyntaxText("datasets", this.datasetName);
    this.addAttributeWithSyntaxText("pageInfo", this.paginationName);
    this.addAttributeWithSyntaxText("onChange", this.tableChangeCallback);
  }

  private createOnChanged() {
    const contextName = this.getState(BasicState.ContextInfo).name;
    const expression = this.helper.useComplexLogicExpression(
      {
        expressions: [
          `
          try {
            current = current || ${this.currentState}.pagination.current || 1;
            pageSize = pageSize || ${this.currentState}.pagination.pageSize || 10;
            ${this.createUpdateState({ loading: true })}
            // throw new Error("developing...");
            // region: mock
            const list = [];
            for (let i = 0; i < pageSize; i++) {
              list.push({ field01: "aaa" + i, field02: "bbb" + i, field03: current, field04: current * pageSize });
            }
            const { items, pagination } = await Promise.resolve({ items: list, pagination: { current: current, pageSize, total: 200 } });
            // endregion
            // const { items, pagination } = await ${this.axiosFn}({ url: \`${this.unionQueryWithFetchApi()}\`});
            console.log(items);
            console.log(pagination);
            ${this.createUpdateState("{ loading: false, dataset: items || [], pagination: { ...pagination } }")}
          } catch (error) {
            ${this.tableNotify.name}.error(String(error));
          }
          `,
        ],
      },
      contextName,
    );
    this.addUnshiftVariable(
      this.tableChangeFn,
      this.helper.createSyntaxExpression(`async ({ current, pageSize }: any) => { ${expression} }`),
    );
    this.addUseObservables(this.tableDataContext, this.tableChangeFn.name);
    this.addUseCallback(this.tableChangeCallback, this.tableChangeFn.name, []);
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

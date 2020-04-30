import { Component } from "@amoebajs/builder";
import { UniversalForm, IUniversalFormState } from "../form/form.component";

@Component({
  name: "filter-board",
  displayName: "过滤面板",
  parent: UniversalForm,
})
export class FilterBoardComponent extends UniversalForm {
  public afterInit() {
    super.afterInit();
    // console.log(this.observer);
    // this.addUseCallback(this.filterOnClick, `(data: any = {}) => { ${this.observer}.next({ ...data }); }`);
  }

  protected getFormStyles(): Record<string, any> {
    return {
      backgroundColor: "#f2f2f2",
      marginBottom: "12px",
      paddingTop: "32px",
      paddingRight: "24px",
      paddingBottom: "32px",
    };
  }

  protected beforeFormChildrenToRender(set: IUniversalFormState["formFields"]) {
    const entries = Object.entries(set);
    for (const [, entry] of entries) {
      if (entry.type === "field") {
        entry.extends.style = {
          display: "inline-flex",
          marginRight: "24px",
          width: "360px",
        };
      }
    }
    super.beforeFormChildrenToRender(set);
  }
}

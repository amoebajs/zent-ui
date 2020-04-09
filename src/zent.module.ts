import { Module } from "@amoebajs/builder";
import { ZentComponent } from "./base/base.component";
import { ZentDirective } from "./base/base.directive";
import { ZentBaseCssDirective } from "./directives/base-css.directive";
import { ZentButtonComponent } from "./components/button.component";
import { ZentComponentImportDirective } from "./directives/base-import.directive";
import { ZentLoadingComponent } from "./loading/block-loading.component";
import { ZentLoadingDirective } from "./loading/loading.directive";
import { UniversalForm } from "./form/form.component";
import { UniversalFormField } from "./form/form-field.directive";
import { UniversalFormSubmit } from "./form/form-submit.directive";
import { UniversalTable } from "./table/table.component";
import { UniversalTableColumn } from "./table/table-column.directive";

@Module({
  name: "zent-module",
  displayName: "Zent模块",
  provider: "react",
  components: [ZentButtonComponent, ZentLoadingComponent, UniversalForm, UniversalTable],
  directives: [
    ZentBaseCssDirective,
    ZentComponentImportDirective,
    ZentLoadingDirective,
    UniversalFormField,
    UniversalFormSubmit,
    UniversalTableColumn,
  ],
  dependencies: {
    rxjs: "^6.5.3",
    zent: "^8.0.0",
    zanPcAjax: "^4.0.0",
  },
})
export class ZentModule {}

export {
  ZentComponent,
  ZentDirective,
  ZentButtonComponent,
  ZentLoadingComponent,
  UniversalForm,
  UniversalTable,
  ZentBaseCssDirective,
  ZentComponentImportDirective,
  ZentLoadingDirective,
  UniversalFormField,
  UniversalFormSubmit,
  UniversalTableColumn,
};

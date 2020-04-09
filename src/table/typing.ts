import { VariableRef } from "@amoebajs/builder";

export interface IUniversalTable {
  tableColumns: IUniversalTableColumn[];
}

export interface IUniversalTableColumn {
  id: VariableRef;
  title: string;
  name?: string;
  width?: string;
  fixed?: TableColumnMode;
  textAlign?: string;
}

export enum TableColumnMode {
  Normal = "normal",
  Left = "left",
  Right = "right",
}

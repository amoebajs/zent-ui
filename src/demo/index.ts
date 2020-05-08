import { Module } from "@amoebajs/builder";
import { LoadingComposition } from "./test.composition";

@Module({
  name: "zent-demo-module",
  displayName: "Zent-Demo模块",
  provider: "react",
  components: [],
  directives: [],
  compositions: [LoadingComposition],
  dependencies: {
    dateFns: "^2.12.0",
    lodash: "^4.17.0",
    rxjs: "^6.5.3",
    zent: "^8.0.0",
    zanPcAjax: "^4.0.0",
  },
})
export class ZentDemoModule {}

export { LoadingComposition };

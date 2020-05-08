import React from "react";
import { Composition, ReactComposition, useReconciler, Input } from "@amoebajs/builder";
import { StackLayout } from "@amoebajs/basic-modules";
import { ZentLoadingDirective } from "../loading/loading.directive";
import { TitleComponent, SectionTitleLevel } from "../title/title.component";

const Loading = useReconciler(ZentLoadingDirective);
const SectionTitle = useReconciler(TitleComponent);
const Stack = useReconciler(StackLayout);

@Composition({
  name: "demo-loading",
  displayName: "DemoLoading",
})
export class LoadingComposition extends ReactComposition {
  @Input({ name: "name" })
  public stateName: string = "loading";

  @Input({ name: "expression" })
  public expression!: string;

  protected async onRender() {
    return (
      <Stack>
        <Loading>
          <Loading.Inputs>
            {!this.expression ? (
              <Loading.stateName>{this.stateName}</Loading.stateName>
            ) : (
              <Loading.expression>{this.expression}</Loading.expression>
            )}
          </Loading.Inputs>
        </Loading>
        <SectionTitle>
          <SectionTitle.Inputs>
            <SectionTitle.text>标题01</SectionTitle.text>
            <SectionTitle.level value={SectionTitleLevel.H4} />
          </SectionTitle.Inputs>
        </SectionTitle>
        <SectionTitle>
          <SectionTitle.Inputs>
            <SectionTitle.text>标题02</SectionTitle.text>
            <SectionTitle.level value={SectionTitleLevel.H4} />
          </SectionTitle.Inputs>
        </SectionTitle>
      </Stack>
    );
  }
}

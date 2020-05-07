import { Component, Utils, Input } from "@amoebajs/builder";
import { ZentComponent } from "../base/base.component";

export enum SectionTitleLevel {
  H1 = "h1",
  H2 = "h2",
  H3 = "h3",
  H4 = "h4",
  H5 = "h5",
}

@Component({
  name: "section-title",
  displayName: "段落标题",
  parent: ZentComponent,
})
export class TitleComponent extends ZentComponent {
  @Input()
  public text: string = "段落标题";

  @Input({ useEnums: Utils.getEnumValues(SectionTitleLevel) })
  public level: SectionTitleLevel = SectionTitleLevel.H5;

  public afterInit() {
    super.afterInit();
    this.setTagName(Utils.DOMS.Div);
    this.addAttributeWithSyntaxText("style", this.createSyntaxStyles());
    this.addRenderPushedChild(
      this.createNode("jsx-element")
        .setTagName(Utils.DOMS.Div)
        .addJsxAttr("style", JSON.stringify(this.getPrefixStyles())),
    );
    this.addRenderPushedChild(this.createNode("jsx-expression").setExpression(`"${this.text}"`));
  }

  protected getFontSize() {
    switch (this.level) {
      case SectionTitleLevel.H1:
        return 28;
      case SectionTitleLevel.H2:
        return 24;
      case SectionTitleLevel.H3:
        return 20;
      case SectionTitleLevel.H4:
        return 16;
      default:
        return 14;
    }
  }

  protected getPrefixStyles() {
    return {
      backgroundColor: "#155bd4",
      marginRight: "4px",
      width: "4px",
      height: this.getFontSize() + 2 + "px",
    };
  }

  protected getElementStyles() {
    return {
      display: "flex",
      alignItems: "flex-end",
      padding: "8px",
      marginBottom: "8px",
      backgroundColor: "#f2f2f2",
      fontWeight: 800,
      fontSize: this.getFontSize() + "px",
    };
  }
}

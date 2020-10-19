import { Injectable, ComponentFactoryResolver, Injector, Compiler, ComponentFactory, Component, ModuleWithComponentFactories, NgModule } from '@angular/core';
import { FeatureContainerComponent } from '../components/feature-container/feature-container.component'
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import PopupTemplate from 'esri/PopupTemplate';
import { CommonModule } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  componentRef: any;
  featureViewTemplate: string;
  featureEditTemplate: string;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private compiler: Compiler,
    private injector: Injector,
    private sanitizer: DomSanitizer,
    private http: HttpClient) {

    this.http.get('assets/templates/featureViewTemplate.html', { responseType: 'text' })
      .subscribe(data => this.featureViewTemplate = data);
    this.http.get('assets/templates/featureEditTemplate.html', { responseType: 'text' })
      .subscribe(data => this.featureEditTemplate = data);
  }

  public getFeatureTemplate(): PopupTemplate {
    return new PopupTemplate({
      title: 'Population in {OBJECTID}',
      content: (result: any) => {
        //return this.createFeatureComponent(feature);
        return this.createFeatureContainerComponent(result.graphic);
      },
      outFields: ['*']
    })
  }

  private createFeatureContainerComponent(feature: any): any {
    // create feature component
    const factory = this.componentFactoryResolver.resolveComponentFactory(FeatureContainerComponent);
    const component = factory.create(this.injector);
    // set feature and trigger change
    component.instance.feature = feature;
    component.changeDetectorRef.detectChanges();
    // return dom-element
    return component.location.nativeElement;
  }

  private createFeatureComponent(feature: any): any {
    let metadata = {
      selector: 'runtime-component',
      template: this.featureViewTemplate
    };
    let factory = this.createComponentFactorySync(this.compiler, metadata, null);
    const component = factory.create(this.injector);

    // set feature and trigger change
    component.instance.feature = feature;
    component.changeDetectorRef.detectChanges();

    // return dom-element
    return component.location.nativeElement;
  }

  private createComponentFactorySync(compiler: Compiler, metadata: Component, componentClass: any): ComponentFactory<any> {
    const cmpClass = componentClass || class RuntimeComponent { name: string = 'fida' };
    const decoratedCmp = Component(metadata)(cmpClass);

    const moduleClass = class RuntimeComponentModule { };
    const decoratedNgModule = NgModule({ imports: [CommonModule], declarations: [decoratedCmp] })(moduleClass);

    const module: ModuleWithComponentFactories<any> = compiler.compileModuleAndAllComponentsSync(decoratedNgModule);
    return module.componentFactories.find(f => f.componentType === decoratedCmp);
  }
}


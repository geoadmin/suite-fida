import { Injectable, ComponentFactoryResolver, Injector, Compiler, ComponentFactory, Component, ModuleWithComponentFactories, NgModule, ElementRef } from '@angular/core';
import { FeatureContainerComponent, FeatureMode } from '../components/feature/feature-container/feature-container.component'
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import Feature from 'esri/Graphic';

@Injectable({ providedIn: 'root' })
export class ComponentService {
  private featureViewTemplate: string;
  private featureEditTemplate: string;

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

  public createFeatureContainerComponent(feature: Feature, featureMode: FeatureMode): ElementRef<any> {
    // create  component
    const factory = this.componentFactoryResolver.resolveComponentFactory(FeatureContainerComponent);
    const component = factory.create(this.injector);
    // set feature and trigger change
    component.instance.setFeature(feature, featureMode);
    component.changeDetectorRef.detectChanges();
    // return dom-element
    return component.location;
  }
  private createFeatureComponent(feature: Feature): any {
    let metadata = {
      selector: 'runtime-component',
      template: this.featureViewTemplate
    };
    let factory = this.createComponentFactorySync(this.compiler, metadata, null);
    const component = factory.create(this.injector);

    // set feature and trigger change
    component.instance.setFeature(feature);
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


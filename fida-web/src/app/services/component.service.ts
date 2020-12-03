import { Injectable, ComponentFactoryResolver, Injector, Compiler, ComponentFactory, Component, ModuleWithComponentFactories, NgModule, ElementRef, ComponentRef } from '@angular/core';
import { FeatureViewComponent } from '../components/feature/feature-view/feature-view.component'
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import Feature from 'esri/Graphic';
import { FidaFeature } from '../models/FidaFeature.model';

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

  public createFeatureViewComponent(feature: FidaFeature): ComponentRef<FeatureViewComponent> {
    // create  component
    const factory = this.componentFactoryResolver.resolveComponentFactory(FeatureViewComponent);
    const component = factory.create(this.injector);
    // set feature and trigger change
    component.instance.setFeature(feature);
    component.changeDetectorRef.detectChanges();
    return component;
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


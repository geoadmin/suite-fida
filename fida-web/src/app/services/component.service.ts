import {
  Injectable, ComponentFactoryResolver, Injector, Compiler, ComponentFactory,
  Component, ModuleWithComponentFactories, NgModule, ComponentRef, Inject
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Feature from '@arcgis/core/Graphic';
import { FidaFeature } from '../models/FidaFeature.model';
import { FeatureViewComponent } from '../components/feature/feature-view/feature-view.component';

@Injectable({ providedIn: 'root' })
export class ComponentService {
  private featureViewTemplate: string;

  constructor(
    @Inject(ComponentFactoryResolver) private componentFactoryResolver: ComponentFactoryResolver,
    @Inject(Compiler) private compiler: Compiler,
    @Inject(Injector) private injector: Injector,
    @Inject(HttpClient) private http: HttpClient) {

    this.http.get('assets/templates/featureViewTemplate.html', { responseType: 'text' })
      .subscribe(data => this.featureViewTemplate = data);
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

  /**
   * NOT JET USED
   */
  private createFeatureComponent(feature: Feature): any {
    const metadata = {
      selector: 'runtime-component',
      template: this.featureViewTemplate
    };
    const factory = this.createComponentFactorySync(this.compiler, metadata, null);
    const component = factory.create(this.injector);

    // set feature and trigger change
    component.instance.setFeature(feature);
    component.changeDetectorRef.detectChanges();

    // return dom-element
    return component.location.nativeElement;
  }

  private createComponentFactorySync(compiler: Compiler, metadata: Component, componentClass: any): ComponentFactory<any> {
    const cmpClass = componentClass || class RuntimeComponent { name = 'fida'; };
    const decoratedCmp = Component(metadata)(cmpClass);

    const moduleClass = class RuntimeComponentModule { };
    const decoratedNgModule = NgModule({ imports: [CommonModule], declarations: [decoratedCmp] })(moduleClass);

    const module: ModuleWithComponentFactories<any> = compiler.compileModuleAndAllComponentsSync(decoratedNgModule);
    return module.componentFactories.find(f => f.componentType === decoratedCmp);
  }
}


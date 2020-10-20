// ng core
import { NgModule, Compiler, COMPILER_OPTIONS, CompilerFactory, APP_INITIALIZER } from '@angular/core';
import { JitCompilerFactory } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

// vendors
import "./configs/esri-config";
import  { SimpleNotificationsModule } from 'angular2-notifications';

// components
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { MapComponent } from './components/map/map.component';
import { FeatureInfoComponent } from './components/feature/feature-info/feature-info.component';
import { FeatureContainerComponent } from './components/feature/feature-container/feature-container.component';
import { FeatureEditComponent } from './components/feature/feature-edit/feature-edit.component'
import { FeatureViewComponent } from './components/feature/feature-view/feature-view.component';
import { AttributeEditComponent } from './components/feature/attribute-edit/attribute-edit.component';

// config
import { ConfigService } from './configs/config.service';
import { FeatureCreateComponent } from './components/feature/feature-create/feature-create.component';

export function initApp(configService: ConfigService) {
  return () => configService.load();
}

// functions
export function createCompiler(compilerFactory: CompilerFactory) {
  return compilerFactory.createCompiler();
}


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MapComponent,
    FeatureInfoComponent,
    FeatureContainerComponent,
    FeatureEditComponent,
    FeatureViewComponent,
    AttributeEditComponent,
    FeatureCreateComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    SimpleNotificationsModule.forRoot()
  ],
  providers: [
    { provide: COMPILER_OPTIONS, useValue: {}, multi: true },
    { provide: CompilerFactory, useClass: JitCompilerFactory, deps: [COMPILER_OPTIONS] },
    { provide: Compiler, useFactory: createCompiler, deps: [CompilerFactory] },
    { provide: APP_INITIALIZER, useFactory: initApp, deps: [ConfigService], multi: true }
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    FeatureInfoComponent,
    FeatureContainerComponent
  ]
})
export class AppModule { }

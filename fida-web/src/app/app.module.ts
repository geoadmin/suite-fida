// ng core
import { NgModule, Compiler, COMPILER_OPTIONS, CompilerFactory, APP_INITIALIZER } from '@angular/core';
import { JitCompilerFactory } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

// vendors
import "./configs/esri-config";
import { SimpleNotificationsModule } from 'angular2-notifications';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// components
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { MapComponent } from './components/map/map.component';
import { FeatureEditComponent } from './components/feature/feature-edit/feature-edit.component'
import { FeatureCreateComponent } from './components/feature/feature-create/feature-create.component';
import { FeatureViewComponent } from './components/feature/feature-view/feature-view.component';
import { AttributeEditComponent } from './components/feature/attribute/attribute-edit/attribute-edit.component';
import { AttributeViewComponent } from './components/feature/attribute/attribute-view/attribute-view.component';
import { AttributeValueEditComponent } from './components/feature/attribute/attribute-value-edit/attribute-value-edit.component';
import { GeometryEditComponent } from './components/feature/geometry-edit/geometry-edit.component';
import { VersionManagerComponent } from './components/version-manager/version-manager.component';
import { VersionCreateDialogComponent } from './components/version-manager/version-create-dialog/version-create-dialog.component';
import { VersionDeleteDialogComponent } from './components/version-manager/version-delete-dialog/version-delete-dialog.component';
import { VersionReconcileDialogComponent } from './components/version-manager/version-reconcile-dialog/version-reconcile-dialog.component';
import { LfpEditComponent } from './components/feature/feature-edit/lfp-edit/lfp-edit.component';
import { NachfuehrungEditComponent } from './components/feature/feature-edit/nachfuehrung-edit/nachfuehrung-edit.component';
import { GrundbuchEditComponent } from './components/feature/feature-edit/grundbuch-edit/grundbuch-edit.component';
import { RueckversicherungEditComponent } from './components/feature/feature-edit/rueckversicherung-edit/rueckversicherung-edit.component';
import { KontaktEditComponent } from './components/feature/feature-edit/kontakt-edit/kontakt-edit.component';
import { AnhangEditComponent } from './components/feature/feature-edit/anhang-edit/anhang-edit.component';

// config
import { ConfigService } from './configs/config.service';
import { DefaultViewComponent } from './components/feature/feature-view/default-view/default-view.component';
import { HfpEditComponent } from './components/feature/feature-edit/hfp-edit/hfp-edit.component';
import { AuslandpunktEditComponent } from './components/feature/feature-edit/auslandpunkt-edit/auslandpunkt-edit.component';
import { SchweremessungEditComponent } from './components/feature/feature-edit/schweremessung-edit/schweremessung-edit.component';
import { SchaedenEditComponent } from './components/feature/feature-edit/schaeden-edit/schaeden-edit.component';
import { LsnEditComponent } from './components/feature/feature-edit/lsn-edit/lsn-edit.component';

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
    FeatureEditComponent,
    FeatureViewComponent,
    AttributeEditComponent,
    FeatureCreateComponent,
    GeometryEditComponent,
    AttributeViewComponent,
    VersionManagerComponent,
    VersionCreateDialogComponent,
    VersionDeleteDialogComponent,
    VersionReconcileDialogComponent,
    LfpEditComponent,
    AttributeValueEditComponent,
    NachfuehrungEditComponent,
    GrundbuchEditComponent,
    RueckversicherungEditComponent,
    KontaktEditComponent,
    AnhangEditComponent,
    DefaultViewComponent,
    HfpEditComponent,
    AuslandpunktEditComponent,
    SchweremessungEditComponent,
    SchaedenEditComponent,
    LsnEditComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    SimpleNotificationsModule.forRoot(),
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot()
  ],
  providers: [
    { provide: COMPILER_OPTIONS, useValue: {}, multi: true },
    { provide: CompilerFactory, useClass: JitCompilerFactory, deps: [COMPILER_OPTIONS] },
    { provide: Compiler, useFactory: createCompiler, deps: [CompilerFactory] },
    { provide: APP_INITIALIZER, useFactory: initApp, deps: [ConfigService], multi: true }
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    FeatureViewComponent
  ]
})
export class AppModule { }

// ng core
import { NgModule, Compiler, COMPILER_OPTIONS, CompilerFactory, APP_INITIALIZER } from '@angular/core';
import { JitCompilerFactory } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';

// vendors
import { SimpleNotificationsModule } from 'angular2-notifications';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

// components
import { AppComponent } from './app.component';
import { ConfigService } from './configs/config.service';
import { HeaderComponent } from './components/header/header.component';
import { MapComponent } from './components/map/map.component';
import { FeatureEditComponent } from './components/feature/feature-edit/feature-edit.component';
import { FeatureCreateComponent } from './components/feature/feature-create/feature-create.component';
import { FeatureViewComponent } from './components/feature/feature-view/feature-view.component';
import { AttributeValueViewComponent } from './components/feature/feature-view/attribute-value-view/attribute-value-view.component';
import { AttributeValueEditComponent } from './components/feature/feature-edit/attribute-value-edit/attribute-value-edit.component';
import { GeometryEditComponent } from './components/feature/geometry-edit/geometry-edit.component';
import { VersionManagerComponent } from './components/version-manager/version-manager.component';
import { VersionCreateDialogComponent } from './components/version-manager/version-create-dialog/version-create-dialog.component';
import { VersionDeleteDialogComponent } from './components/version-manager/version-delete-dialog/version-delete-dialog.component';
import { VersionReconcileDialogComponent } from './components/version-manager/version-reconcile-dialog/version-reconcile-dialog.component';
import { LfpEditComponent } from './components/feature/feature-edit/lfp-edit/lfp-edit.component';
import { NachfuehrungEditComponent } from './components/feature/feature-edit/nachfuehrung-edit/nachfuehrung-edit.component';
import { GrundbuchEditComponent } from './components/feature/feature-edit/grundbuch-edit/grundbuch-edit.component';
import { RueckversicherungEditComponent } from './components/feature/feature-edit/rueckversicherung-edit/rueckversicherung-edit.component';
import { AnhangEditComponent } from './components/feature/feature-edit/anhang-edit/anhang-edit.component';
import { HfpEditComponent } from './components/feature/feature-edit/hfp-edit/hfp-edit.component';
import { AuslandpunktEditComponent } from './components/feature/feature-edit/auslandpunkt-edit/auslandpunkt-edit.component';
import { SchweremessungEditComponent } from './components/feature/feature-edit/schweremessung-edit/schweremessung-edit.component';
import { SchaedenEditComponent } from './components/feature/feature-edit/schaeden-edit/schaeden-edit.component';
import { LsnEditComponent } from './components/feature/feature-edit/lsn-edit/lsn-edit.component';
import { KontaktEditDialogComponent } from './components/feature/kontakt-manager/kontakt-edit-dialog/kontakt-edit-dialog.component';
import { KontaktManagerComponent } from './components/feature/kontakt-manager/kontakt-manager.component';
import { KontaktViewComponent } from './components/feature/feature-view/kontakt-view/kontakt-view.component';
import { FidaTranslateLoader } from './helpers/FidaTranslateLoader';
import { DifferenceTreeComponent } from './components/version-manager/version-reconcile-dialog/difference-tree/difference-tree.component';
import { DifferenceListTreeComponent } from './components/version-manager/version-reconcile-dialog/difference-list-tree/difference-list-tree.component';
import { DifferenceAttributeTreeComponent } from './components/version-manager/version-reconcile-dialog/difference-attribute-tree/difference-attribute-tree.component';
import { AttributeMultiselectComponent } from './components/feature/feature-edit/attribute-multiselect/attribute-multiselect.component';

// config
export function initApp(configService: ConfigService): any {
  return () => configService.load();
}

// functions
export function createCompiler(compilerFactory: CompilerFactory): Compiler {
  return compilerFactory.createCompiler();
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MapComponent,
    FeatureEditComponent,
    FeatureViewComponent,
    FeatureCreateComponent,
    GeometryEditComponent,
    AttributeValueViewComponent,
    VersionManagerComponent,
    VersionCreateDialogComponent,
    VersionDeleteDialogComponent,
    VersionReconcileDialogComponent,
    LfpEditComponent,
    AttributeValueEditComponent,
    NachfuehrungEditComponent,
    GrundbuchEditComponent,
    RueckversicherungEditComponent,
    AnhangEditComponent,
    HfpEditComponent,
    AuslandpunktEditComponent,
    SchweremessungEditComponent,
    SchaedenEditComponent,
    LsnEditComponent,
    KontaktEditDialogComponent,
    KontaktManagerComponent,
    KontaktViewComponent,
    DifferenceTreeComponent,
    DifferenceListTreeComponent,
    DifferenceAttributeTreeComponent,
    AttributeMultiselectComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    SimpleNotificationsModule.forRoot(),
    ModalModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    TypeaheadModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient, configService: ConfigService) => new FidaTranslateLoader(http, configService),
        deps: [HttpClient, ConfigService]
      }
    })
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

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { MapComponent } from './components/map/map.component';
import { FeatureInfoComponent } from './components/feature-info/feature-info.component';

import "./configs/esri-config";


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MapComponent,
    FeatureInfoComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

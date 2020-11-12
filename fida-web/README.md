# fida web application

Based on [Angular](https://angular.io/) 10.

Noteworthy packages:

- [Bootstrap 4](https://getbootstrap.com/) - UI components
- [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript/) set up like this [Example](https://github.com/Esri/angular-cli-esri-map/tree/arcgis-webpack-angular) - Map and general GIS functionality

Note: all commands are meant to be run in `/fida-web`.

## Run

`npm run start` - start local dev server

Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

`npm run build` - default build

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## deploy 

For the simplest deployment, create a production build and copy the build to the web server.

`ng build --base-href /fida-web/`
`cp -r dist\fida-web \\S7T4202A.adr.admin.ch\FIDA$\`


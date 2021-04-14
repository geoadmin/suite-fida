export interface EnvironmentInterface {
  arcGisServer: string;
  arcGisPortal: string;
  system: System;
}

export enum System {
  Production = 'P',
  Integration = 'I',
  Test = 'T'
}

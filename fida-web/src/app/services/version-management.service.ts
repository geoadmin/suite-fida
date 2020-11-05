import { Injectable } from '@angular/core';
import { ConfigService } from '../configs/config.service';
import { VersionManagementConfig } from '../models/config.model';
import { GdbVersion } from '../models/GdbVersion.model';
import { QueryService } from './query.service';

@Injectable({
  providedIn: 'root'
})
export class VersionManagementService {
  private versionManagmentConfig: VersionManagementConfig;

  constructor(
    private configService: ConfigService,
    private queryService: QueryService,
  ) {
    this.versionManagmentConfig = this.configService.getVersionManagementConfig();
  }

  public async getVersionInfos(): Promise<GdbVersion[]> {
    const url = `${this.versionManagmentConfig.serverUrl}/versionInfos/`;
    const result = await this.queryService.request(url, {}, true);
    return result.data.versions;
  }

  public async createVersion(versionName: string, description?: string): Promise<GdbVersion> {
    const options = {
      versionName: versionName,
      description: description,
      accessPermission: 'public'
    }

    const url = `${this.versionManagmentConfig.serverUrl}/create/`;
    const result = await this.queryService.request(url, options, true);
    return result.data.versionInfo;
  }

  public async deleteVersion(versionName: string): Promise<boolean> {
    const options = {
      versionName: versionName
    }

    const url = `${this.versionManagmentConfig.serverUrl}/delete/`;
    const result = await this.queryService.request(url, options, true);
    return result.data.success;
  }

  public async differences(version: GdbVersion): Promise<any> {
    const options = {
      sessionId: version.versionGuid//,
      //resultType: 'features'
    }

    const versionUrl = this.stripBrackets(version.versionGuid);
    const url = `${this.versionManagmentConfig.serverUrl}/versions/${versionUrl}/differences`;
    const result = await this.queryService.request(url, options, true);
    return result.data;
  }

  public async reconcile(version: GdbVersion): Promise<any> {
    const options = {
      sessionId: version.versionGuid,
      abortIfConflicts: false,
      withPost: true
    }

    const versionUrl = this.stripBrackets(version.versionGuid);
    const url = `${this.versionManagmentConfig.serverUrl}/versions/${versionUrl}/reconcile`;
    const result = await this.queryService.request(url, options, true);
    return result.data;
  }

  public async startReading(version: GdbVersion): Promise<any> {
    const options = {
      sessionId: version.versionGuid
    }

    const versionUrl = this.stripBrackets(version.versionGuid);
    const url = `${this.versionManagmentConfig.serverUrl}/versions/${versionUrl}/startReading/`;
    const result = await this.queryService.request(url, options, true);
    return result.data;
  }

  public async stopReading(version: GdbVersion): Promise<any> {
    const options = {
      sessionId: version.versionGuid,
      saveEdits: true
    }

    const versionUrl = this.stripBrackets(version.versionGuid);
    const url = `${this.versionManagmentConfig.serverUrl}/versions/${versionUrl}/stopReading/`;
    const result = await this.queryService.request(url, options, true);
    return result.data;
  }

  public async startEditing(version: GdbVersion): Promise<any> {
    const options = {
      sessionId: version.versionGuid
    }

    const versionUrl = this.stripBrackets(version.versionGuid);
    const url = `${this.versionManagmentConfig.serverUrl}/versions/${versionUrl}/startEditing/`;
    const result = await this.queryService.request(url, options, true);
    return result.data;
  }

  public async stopEditing(version: GdbVersion): Promise<any> {
    const options = {
      sessionId: version.versionGuid,
      saveEdits: true
    }

    const versionUrl = this.stripBrackets(version.versionGuid);
    const url = `${this.versionManagmentConfig.serverUrl}/versions/${versionUrl}/stopEditing/`;
    const result = await this.queryService.request(url, options, true);
    return result.data;
  }

  public async purgeLock(version: GdbVersion): Promise<any> {
    const options = {
      versionName: version.versionName
    }

    const versionUrl = this.stripBrackets(version.versionGuid);
    const url = `${this.versionManagmentConfig.serverUrl}/purgeLock/`;
    const result = await this.queryService.request(url, options, true);
    return result.data;
  }

  public getDefaultVersionName(): string {
    return this.versionManagmentConfig.defaultVersion;
  }

  private stripBrackets(value: string){
    return value.replace('{','').replace('}','');
  }
}

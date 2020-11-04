import { Injectable } from '@angular/core';
import { ConfigService } from '../configs/config.service';
import { GdbVersion } from '../models/GdbVersion.model';
import { QueryService } from './query.service';

@Injectable({
  providedIn: 'root'
})
export class VersionManagementService {

  constructor(
    private configService: ConfigService,
    private queryService: QueryService,
  ) { }

  async getVersionInfos(): Promise<GdbVersion[]> {
    const url = this.configService.getVersionManagementServer() + "/versionInfos";
    const result = await this.queryService.request(url);
    return result.data.versions;
  }

  async createVersion(versionName: string, description?: string): Promise<GdbVersion> {
    const options = {
      versionName: versionName,
      description: description
    }

    const url = this.configService.getVersionManagementServer() + "/create";
    const result = await this.queryService.request(url, options, true);
    return result.data.versionInfo;
  }

  async deleteVersion(versionName: string): Promise<boolean> {
    const options = {
      versionName: versionName
    }

    const url = this.configService.getVersionManagementServer() + "/delete";
    const result = await this.queryService.request(url, options, true);
    return result.data.success;
  }

}

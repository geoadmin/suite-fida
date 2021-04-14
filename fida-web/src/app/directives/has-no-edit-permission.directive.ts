import { Directive, TemplateRef, ViewContainerRef } from '@angular/core';
import { PermissionService } from '../services/permission.service';


@Directive({
  selector: '[appHasNoEditPermission]'
})
export class HasNoEditPermissionDirective {

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {
    if (!this.permissionService.hasEditPermission()) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

}

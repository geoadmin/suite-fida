import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentService } from '../component.service';
import { FeatureViewComponent } from '../../components/feature/feature-view/feature-view.component';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FeatureService } from '../feature.service';
import { WidgetNotifyService } from '../widget-notify.service';
import { Subject } from 'rxjs';
import { FidaFeature } from 'src/app/models/FidaFeature.model';

describe('ComponentService', () => {
  let service: ComponentService;
  let httpTestingController: HttpTestingController;

  /**
   *  Stubs and Mocks
   */

  class FeatureViewComponentStub {
    get = () => new Subject();
  }

  class BsModalServiceStub { }
  class WidgetNotifyServiceStub { }
  class ChangeDetectorRefStub { }

  /**
   * Run before each test block
   */

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ComponentService,
        { provide: FeatureViewComponent, useClass: FeatureViewComponentStub, },
        { provide: BsModalService, useClass: BsModalServiceStub, },
        { provide: WidgetNotifyService, useClass: WidgetNotifyServiceStub, },
        { provide: ChangeDetectorRef, useClass: ChangeDetectorRefStub, }
      ]
    });
    service = TestBed.inject(ComponentService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  /**
   * Test blocks
   */

  it('constructor', () => {
    expect(service).toBeTruthy();
  });

  xit('createFeatureViewComponent', () => {
    const fidaFeature: FidaFeature = new FidaFeature();
    const componentRef = service.createFeatureViewComponent(fidaFeature);

    expect(service).toBeTruthy();
  });
});

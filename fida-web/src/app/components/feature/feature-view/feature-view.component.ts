import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import Feature from 'esri/Graphic';
import Attachments from 'esri/widgets/Attachments';
import { FidaFeature } from 'src/app/models/FidaFeature.model';

@Component({
  selector: 'app-feature-view',
  templateUrl: './feature-view.component.html',
  styleUrls: ['./feature-view.component.scss']
})
export class FeatureViewComponent implements OnInit {
  @ViewChild('attachemts', { static: true }) attachmentsContainer: ElementRef;

  @Input() feature: FidaFeature;

  constructor() { }

  ngOnInit(): void {
    const attachments = new Attachments({
      container: this.attachmentsContainer.nativeElement,
      graphic: this.feature
    });
    attachments.viewModel.mode = 'view';
  }

}

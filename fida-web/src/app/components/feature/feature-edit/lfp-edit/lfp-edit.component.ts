import { Component, Input, OnInit } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { FidaFeature } from 'src/app/models/FidaFeature.model';

@Component({
  selector: 'app-lfp-edit',
  templateUrl: './lfp-edit.component.html',
  styleUrls: ['./lfp-edit.component.scss'],
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class LfpEditComponent implements OnInit {
  @Input() feature: FidaFeature;

  constructor() { }

  ngOnInit(): void {
  }

}

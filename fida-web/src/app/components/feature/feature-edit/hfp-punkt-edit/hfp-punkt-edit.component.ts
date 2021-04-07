import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FidaFeature } from 'src/app/models/FidaFeature.model';

@Component({
  selector: 'app-hfp-punkt-edit',
  templateUrl: './hfp-punkt-edit.component.html',
  styleUrls: ['./hfp-punkt-edit.component.scss']
})
export class HfpPunktEditComponent implements OnInit {

  @Input() feature: FidaFeature;
  @Input() formGroup: FormGroup;
  @Input() readonly = false;
  @Input() language: string;
  public componentId: string;
  public workAbbreviationList: string[];

  constructor() { }

  ngOnInit(): void {
  }

}

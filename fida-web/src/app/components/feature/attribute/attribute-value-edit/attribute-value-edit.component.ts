import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import FeatureLayer from 'esri/layers/FeatureLayer';
import CodedValueDomain from 'esri/layers/support/CodedValueDomain';
import Field from 'esri/layers/support/Field';
import { FidaFeature } from 'src/app/models/FidaFeature.model';

@Component({
  selector: 'app-attribute-value-edit',
  templateUrl: './attribute-value-edit.component.html',
  styleUrls: ['./attribute-value-edit.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AttributeValueEditComponent),
      multi: true
    }
  ]
})
export class AttributeValueEditComponent implements OnInit, ControlValueAccessor {
  @Input() feature: FidaFeature;
  //@Input() name: string;
  @Input() formControlName: string; // must be the same as feature-attribute-name
  @Input() placeholder: string;
  @Input() type: string;

  public formGroup: FormGroup;
  public disabled: boolean;
  private field: Field;

  constructor() { }

  ngOnInit(): void {
    // create form-control
    const formControl = new FormControl();
    this.formGroup = new FormGroup({
      value: formControl
    });

    // get field
    this.field = this.getFeatureLayer().fields.find(f => f.name === this.formControlName);
    if (this.field === undefined) {
      throw new Error(`Field ${this.formControlName} not found in layer ${this.feature.layer.id}`);
    }

    // convert value to date-object
    if (this.field.type === 'date') {
      const value = this.feature.attributes[this.formControlName];
      if (value && value !== null) {
        this.feature.attributes[this.formControlName] = new Date(value);
      }
    }

    // define validation form-control
    const validators: any = [];
    if (this.field.nullable === false) {
       validators.push(Validators.required);
    }
    formControl.setValidators(validators);

  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
  }

  private getFeatureLayer(): FeatureLayer {
    return this.feature?.layer as FeatureLayer;
  }

  getFieldType(): string {
    if (this.type) {
      return this.type;
    }

    if (!this.field) {
      return;
    }

    if (this.field.domain !== null && this.field.domain.type === 'coded-value') {
      return 'domain';
    }

    if (this.field.type === 'small-integer'
      || this.field.type === 'integer'
      || this.field.type === 'single'
      || this.field.type === 'double') {
      return 'number'
    }

    return this.field.type;
  }

  getCodedValues(): object[] {
    const codedValueDomain = this.field.domain as CodedValueDomain;
    return codedValueDomain.codedValues ?? [];
  }

  /**
  * ControlValueAccessor
  */

  onChange: any = () => { }
  onTouched: any = () => { }

  writeValue(value: any): void {
    value && this.formGroup.get(this.formControlName).setValue(value);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

}

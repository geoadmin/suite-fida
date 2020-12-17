import { Component, forwardRef, Input, OnInit } from '@angular/core';
import {
  AbstractControl, ControlValueAccessor, FormControl, FormGroup,
  NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validators
} from '@angular/forms';
import { FidaTranslateService } from 'src/app/services/translate.service';
import { FidaFeature } from 'src/app/models/FidaFeature.model';
import { UtilService } from 'src/app/services/util.service';
import FeatureLayer from 'esri/layers/FeatureLayer';
import CodedValueDomain from 'esri/layers/support/CodedValueDomain';
import Field from 'esri/layers/support/Field';

@Component({
  selector: 'app-attribute-value-edit',
  templateUrl: './attribute-value-edit.component.html',
  styleUrls: ['./attribute-value-edit.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AttributeValueEditComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AttributeValueEditComponent),
      multi: true
    }
  ]
})
export class AttributeValueEditComponent implements OnInit, ControlValueAccessor {
  @Input() feature: FidaFeature;
  @Input() formControlName: string; // must be the same as feature-attribute-name
  @Input() placeholder: string;
  @Input() type: string;
  @Input() required = false;

  public formGroup: FormGroup;
  public disabled: boolean;
  public field: Field;
  public date: Date;
  public codedValues: object[];

  constructor(private translateService: FidaTranslateService) { }

  ngOnInit(): void {
    if (!this.placeholder) {
      this.placeholder = '';
    }

    // create form-control
    const formControl = new FormControl();
    this.formGroup = new FormGroup({
      valueControl: formControl
    });

    // get field
    this.field = this.getFeatureLayer().fields.find(f => f.name === this.formControlName);
    if (this.field === undefined) {
      console.error(`Field ${this.formControlName} not found in layer ${this.feature.layer.title} (${this.feature.layer.id})`);
      return;
    }

    // define type
    this.defineFieldType();

    // convert value to date-object
    if (this.type === 'date') {
      this.date = UtilService.esriToDate(this.feature.attributes[this.formControlName]);
    }

    // translate coded values
    if (this.type === 'domain') {
      const codedValueDomain = this.field.domain as CodedValueDomain;
      this.codedValues =  this.translateService.translateCodedValueDomain(codedValueDomain).codedValues ?? [];
    }

    // define validation form-control
    const validators: any = [];
    if (this.field.nullable === false || this.required === true) {
      validators.push(Validators.required);
    }
    if (this.field.length && this.field.length > 0) {
      validators.push(Validators.maxLength(this.field.length));
    }
    formControl.setValidators(validators);

  }

  onDateChanged(): void {
    this.feature.attributes[this.formControlName] = this.date ? this.date.valueOf() : null;
  }

  private getFeatureLayer(): FeatureLayer {
    return this.feature?.layer as FeatureLayer;
  }

  defineFieldType(): string {
    if (this.type || !this.field) {
      return;
    }

    if (this.field.domain != null && this.field.domain.type === 'coded-value') {
      this.type = 'domain';
    } else if (this.field.type === 'small-integer'
      || this.field.type === 'integer'
      || this.field.type === 'single'
      || this.field.type === 'double') {
      this.type = 'number';
    } else {
      this.type = this.field.type;
    }
  }

  /**
   * ControlValueAccessor
   */

  onChange: any = () => { };
  onTouched: any = () => { };

  writeValue(value: any): void {
    if (value != null) {
      this.formGroup?.controls.valueControl.setValue(value);
    }
  }

  registerOnChange(fn: any): void {
    this.formGroup.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.formGroup.valid ?
      null :
      {
        invalidAttributeValue: {
          valid: false,
          message: `attribute-value [${this.formControlName}] is invalid`
        }
      };
  }
}

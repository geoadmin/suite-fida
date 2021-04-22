import { Component, forwardRef, Input, OnInit, TemplateRef } from '@angular/core';
import {
  AbstractControl, ControlValueAccessor, FormControl, FormGroup,
  NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validators
} from '@angular/forms';
import { FidaTranslateService } from 'src/app/services/translate.service';
import { FidaFeature } from 'src/app/models/FidaFeature.model';
import { UtilService } from 'src/app/services/util.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { QueryService } from 'src/app/services/query.service';
import { mergeMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import CodedValueDomain from '@arcgis/core/layers/support/CodedValueDomain';
import Field from '@arcgis/core/layers/support/Field';
import { UniqueValidator } from 'src/app/helpers/UniqueValidator';

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
  @Input() readonly = false;
  @Input() unique = false;
  @Input() list: string[] = [];
  @Input() typeaheadFeatureLayer: FeatureLayer;

  public formGroup: FormGroup;
  public disabled: boolean;
  public field: Field;
  public displayFieldName: string;
  public date: Date;
  public codedValues: object[];
  public tags: string[] = [];
  public addTagNumber: number;
  public addTagText: string;
  public multiselectItems: string[] = [];
  public multiselectSettings: IDropdownSettings;
  public typeaheadLoading: boolean;
  public typeaheadNoResults: boolean;
  public typeaheadSelectedItem: string;
  public typeaheadList: Observable<any>;
  public typeaheadText: string;

  private delimiter = ',';
  private modalRef: BsModalRef;


  constructor(
    private translateService: FidaTranslateService,
    private queryService: QueryService,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
    if (!this.placeholder) {
      this.placeholder = '';
    } else {
      this.placeholder = this.translateService.translate(this.placeholder);
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

    // display is needed for the validation-message
    this.displayFieldName = this.translateFormControlName();

    // define type
    this.defineFieldType();

    // convert value to date-object
    if (this.type === 'date') {
      this.date = UtilService.esriToDate(this.feature.attributes[this.formControlName]);
    }

    if (this.type === 'multiselect') {
      this.multiselectSettings = {
        enableCheckAll: false,
        allowSearchFilter: true,
        searchPlaceholderText: this.translateService.translate('app.search.title'),
        clearSearchFilter: true
      };
      const multiselectString = this.feature.attributes[this.formControlName] as string;
      this.multiselectItems = multiselectString != null ?
        multiselectString.split(this.delimiter).map(m => m.trim()) : [];
    }

    if (this.type === 'tags') {
      const tagString = this.feature.attributes[this.formControlName] as string;
      this.tags = tagString != null ?
        tagString.split(this.delimiter).map(m => m.trim()) : [];
    }

    if (this.type === 'typeahead') {
      this.typeaheadList = new Observable((observer: any) => {
        observer.next(this.feature.attributes[this.formControlName]);
      }).pipe(mergeMap((searchText: string) => {
        return this.queryTypeaheadFeatures(searchText);
      }));
    }

    // translate coded values
    if (this.type === 'domain') {
      const codedValueDomain = this.field.domain as CodedValueDomain;
      this.codedValues = this.translateService.translateCodedValueDomain(codedValueDomain).codedValues ?? [];
    }

    this.defineValidation(formControl);
  }

  private defineValidation(formControl: FormControl): void {
    const validators: any = [];
    const asyncValidators: any = [];
    if (this.field.nullable === false || this.required === true) {
      validators.push(Validators.required);
    }
    if (this.field.length && this.field.length > 0) {
      validators.push(Validators.maxLength(this.field.length));
    }
    if (!this.readonly && this.unique) {
      asyncValidators.push(UniqueValidator.createValidator(this.getFeatureLayer(), this.field, this.queryService));
    }
    formControl.setValidators(validators);
    formControl.setAsyncValidators(asyncValidators);
  }

  onDateChanged(): void {
    this.feature.attributes[this.formControlName] = this.date ? this.date.valueOf() : null;
  }

  onMultiselectChanged(item: string): void {
    this.feature.attributes[this.formControlName] =
      this.multiselectItems.length > 0 ? this.multiselectItems.join(this.delimiter + ' ') : null;
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
    } else if (UtilService.isNumberField(this.field)) {
      this.type = 'number';
    } else {
      this.type = this.field.type;
    }
  }

  translateFormControlName(): string {
    // TODO: find better way
    const layerName = (this.feature.layer as any)?.templates[0]?.name || '';
    return this.translateService.translateAttributeName(layerName, this.formControlName);
  }

  /**
   * typeahead
   */

  public async queryTypeaheadFeatures(searchText: string): Promise<any> {
    const where = `LOWER(${this.formControlName}) like '%${searchText.toLocaleLowerCase()}%'`;
    const outFields = [this.formControlName];

    return this.queryService.whereDistinct(this.typeaheadFeatureLayer, where, outFields).then(features => {
      return features.map(feature => {
        return feature.attributes[this.formControlName];
      });
    });
  }

  public onTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
    if (this.typeaheadLoading) {
      this.typeaheadSelectedItem = undefined;
    }
  }

  public onTypeaheadNoResults(e: boolean): void {
    this.typeaheadNoResults = e;
  }

  public onTypeaheadSelect(e: TypeaheadMatch): void {
    this.typeaheadSelectedItem = e.item;
  }

  /**
   * add / remove tag
   */

  showAddTagDialogClick(template: TemplateRef<any>): void {
    this.addTagNumber = undefined;
    this.addTagText = undefined;
    this.modalRef = this.modalService.show(template, { class: 'modal-sm modal-dialog-centered' });
  }

  addTagClick(): void {
    if (this.addTagText) {
      const tag = UtilService.getToLine(this.addTagNumber, this.addTagText);
      if (tag && tag.trim() !== '') {
        this.tags.push(tag);
        this.onTagChanged();
      }
    }
    this.modalRef.hide();
  }

  cancelTagClick(): void {
    this.modalRef.hide();
  }

  onTagChanged(): void {
    // convert all to string
    const tags = this.tags.map((tag: any) => typeof tag === 'object' ? tag.value : tag);
    this.feature.attributes[this.formControlName] = tags.length > 0 ? tags.join(this.delimiter + ' ') : null;
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

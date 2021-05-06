import { AbstractControl, ValidatorFn, ValidationErrors, FormControl } from '@angular/forms';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Field from '@arcgis/core/layers/support/Field';
import { QueryService } from '../services/query.service';

export class NumberValidator {
  static createValidator(prms = {}): ValidatorFn {
    return (control: FormControl): {[key: string]: any} => {
      if(isPresent(Validators.required(control))) {
        return null;
      }
      
      let val: number = control.value;

      if(isNaN(val) || /\D/.test(val.toString())) {
        
        return {"number": true};
      } else if(!isNaN(prms.min) && !isNaN(prms.max)) {
        
        return val < prms.min || val > prms.max ? {"number": true} : null;
      } else if(!isNaN(prms.min)) {
        
        return val < prms.min ? {"number": true} : null;
      } else if(!isNaN(prms.max)) {
        
        return val > prms.max ? {"number": true} : null;
      } else {
        
        return null;
      }
    };
  }
}

function isPresent(arg0: any) {
  throw new Error('Function not implemented.');
}


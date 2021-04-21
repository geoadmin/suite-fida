import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Field from '@arcgis/core/layers/support/Field';
import { QueryService } from '../services/query.service';

export class UniqueValidator {
  static createValidator(featureLayer: FeatureLayer, field: Field, queryService: QueryService): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors> => {
      if (control.value && control.value !== '') {

        let where = `${field.name}=`;
        where += field.type === 'string' ? `'${control.value}'` : `'${control.value}'`;

        return queryService.count(featureLayer, where).then(count => {
          console.log('UniqueValidator: ' + count);
          return count > 0 ? { invalidUnique: true } : null;
        });
      }

      return Promise.resolve(null);
    };
  }
}


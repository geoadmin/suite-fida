import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Field from '@arcgis/core/layers/support/Field';
import { FidaFeature } from '../models/FidaFeature.model';
import { QueryService } from '../services/query.service';

export class UniqueValidator {
  static createValidator(
    featureLayer: FeatureLayer,
    feature: FidaFeature,
    controlField: Field,
    additionalField: Field,
    queryService: QueryService
  ): AsyncValidatorFn {
    return (control: AbstractControl): Promise<ValidationErrors> => {
      if (control.value && control.value !== null && control.value !== '') {

        let where = `${controlField.name}=`;
        where += controlField.type === 'string' ? `'${control.value}'` : `${control.value}`;

        if (additionalField) {
          const additionalValue = feature.attributes[additionalField.name];
          where += ` AND ${additionalField.name}=`;
          where += additionalField.type === 'string' ? `'${additionalValue}'` : `${additionalValue}`;
        }

        // do not take yourself into acount
        const oid = feature.attributes.OBJECTID;
        if (oid != null) {
          where += ` AND OBJECTID <> ${oid}`;
        }

        return queryService.count(featureLayer, where).then(count => {
          console.log('UniqueValidator: ' + count, where);
          return count > 0 ? { invalidUnique: true } : null;
        });
      }

      return Promise.resolve(null);
    };
  }
}


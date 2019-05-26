import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, ValidationErrors, FormGroup } from '@angular/forms';
import { MustMatch, MustNotMatch } from '../validator/match-fields.validator';


@Directive({
    selector: '[appMustMatch]',
    providers: [{ provide: NG_VALIDATORS, useExisting: MustMatchDirective, multi: true }]
})
export class MustMatchDirective implements Validator {
    @Input('appMustMatch') mustMatch: string[] = [];

    validate(formGroup: FormGroup): ValidationErrors {
        var shouldMatch = this.mustMatch[2];
        if (shouldMatch === 'YES'){
            return MustMatch(this.mustMatch[0], this.mustMatch[1])(formGroup);
        }else{
            return MustNotMatch(this.mustMatch[0], this.mustMatch[1])(formGroup);
        }
    }
}
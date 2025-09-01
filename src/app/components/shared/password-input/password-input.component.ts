import { Component, input, effect, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { detailedPasswordValidator } from '../../../common/const/custom-validators';

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PasswordModule,
    DividerModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="password-field">
      <p-password
        [id]="inputId()"
        [formControl]="passwordControl"
        [feedback]="showFeedback()"
        [toggleMask]="toggleMask()"
        [placeholder]="placeholder()"
        [promptLabel]="promptLabel()"
        [weakLabel]="weakLabel()"
        [mediumLabel]="mediumLabel()"
        [strongLabel]="strongLabel()"
        [autocomplete]="autocomplete()"
        [styleClass]="styleClass()">
        
        <ng-template #footer *ngIf="showRules()">
          <p-divider></p-divider>
          <ul class="password-rules">
            <li [class.valid]="passwordControl.value && !hasError('noLowerCase')">
              <i class="pi" [ngClass]="passwordControl.value && !hasError('noLowerCase') ? 'pi-check' : 'pi-times'"></i>
              <span>לפחות אות קטנה אחת</span>
            </li>
            <li [class.valid]="passwordControl.value && !hasError('noUpperCase')">
              <i class="pi" [ngClass]="passwordControl.value && !hasError('noUpperCase') ? 'pi-check' : 'pi-times'"></i>
              <span>לפחות אות גדולה אחת</span>
            </li>
            <li [class.valid]="passwordControl.value && !hasError('noNumeric')">
              <i class="pi" [ngClass]="passwordControl.value && !hasError('noNumeric') ? 'pi-check' : 'pi-times'"></i>
              <span>לפחות ספרה אחת</span>
            </li>
            <li [class.valid]="passwordControl.value && !hasError('minLength')">
              <i class="pi" [ngClass]="passwordControl.value && !hasError('minLength') ? 'pi-check' : 'pi-times'"></i>
              <span>מינימום {{ minLength() }} תווים</span>
            </li>
          </ul>
        </ng-template>
      </p-password>
      
      @if (showErrorMessage() && passwordControl.touched && passwordControl.invalid) {
        <span class="error-message">
          @if (passwordControl.hasError('required')) { יש להזין סיסמה }
          @if (passwordControl.hasError('minlength')) { הסיסמה חייבת להכיל לפחות {{ minLength() }} תווים }
          @if (passwordControl.hasError('weakPassword')) { הסיסמה חייבת להכיל אות גדולה, קטנה ומספר }
        </span>
      }
    </div>
  `,
  styles: [`
    :host {
      --p-password-strength-weak-background: linear-gradient(135deg, var(--red-500) 0%, var(--red-600) 50%, var(--red-700) 100%);
      --p-password-strength-medium-background: linear-gradient(135deg, var(--yellow-500) 0%, var(--yellow-600) 50%, var(--yellow-700) 100%);
      --p-password-strength-strong-background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 50%, var(--primary-700) 100%);
    }

    ::ng-deep .p-password-meter-text{
      font-size: 12px;
      padding: 0;
      margin: auto 0;
    }

    /* Password rules styling */
    .password-rules {
      list-style-type: none;
      padding: 0 1rem;
      margin: 0;
      font-size: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      
      li {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--grey-500); 
        transition: color 0.3s ease;
      }
      
      li .pi {
        font-size: 0.8rem;
        transition: color 0.3s ease;
        color: var(--red-400); 
      }
      
      li.valid span {
        color: var(--green-600); 
        text-decoration: line-through; 
      }
      
      li.valid .pi {
        color: var(--green-500); 
      }
    }


    .password-field {
      width: 100%;
    }
  `]
})
export class PasswordInputComponent implements ControlValueAccessor {
  // ✅ Using signal inputs
  inputId = input<string>('password');
  showFeedback = input<boolean>(true);
  toggleMask = input<boolean>(true);
  placeholder = input<string>('לפחות 8 תווים');
  promptLabel = input<string>('הזן סיסמה');
  weakLabel = input<string>('חלשה מדי');
  mediumLabel = input<string>('סבירה');
  strongLabel = input<string>('סיסמה חזקה');
  autocomplete = input<string>('new-password');
  styleClass = input<string>('');
  showRules = input<boolean>(true);
  showErrorMessage = input<boolean>(true);
  minLength = input<number>(8);
  useCustomValidator = input<boolean>(true);

  passwordControl = new FormControl('');

  constructor() {
    // ✅ Using effect to react to input changes
    effect(() => {
      this.updateValidators();
    });
    
    // Subscribe to password control changes
    this.passwordControl.valueChanges.subscribe(value => {
      this.onChange(value || '');
    });

    this.passwordControl.statusChanges.subscribe(() => {
        if (this.passwordControl.touched) {
            this.onTouched();
        }
    });
  }

  private updateValidators() {
    const validators: ValidatorFn[] = [Validators.required];
    
    if (this.useCustomValidator()) {
      validators.push(detailedPasswordValidator());
    } else {
      validators.push(Validators.minLength(this.minLength()));
    }
    
    this.passwordControl.setValidators(validators);
    this.passwordControl.updateValueAndValidity();
  }

  private onChange = (value: string) => {};
  private onTouched = () => {};

  // ControlValueAccessor methods
  writeValue(value: string): void {
    this.passwordControl.setValue(value || '', { emitEvent: false });
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
    // this.passwordControl.valueChanges.subscribe(() => {
    //   if (!this.passwordControl.touched) {
    //     this.passwordControl.markAsTouched();
    //     this.onTouched();
    //   }
    // });
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.passwordControl.disable();
    } else {
      this.passwordControl.enable();
    }
  }

  // Helper method to check for specific errors
  hasError(errorKey: string): boolean {
    return this.passwordControl.hasError(errorKey);
  }

  // Method to set errors from parent form
  setErrors(errors: any): void {
    this.passwordControl.setErrors(errors);
  }

  // Method to mark as touched
  markAsTouched(): void {
    this.passwordControl.markAsTouched();
    this.onTouched()
  }

  // Getter for validation state
  get isValid(): boolean {
    return this.passwordControl.valid;
  }

  get isInvalid(): boolean {
    return this.passwordControl.invalid;
  }

  get isTouched(): boolean {
    return this.passwordControl.touched;
  }
}
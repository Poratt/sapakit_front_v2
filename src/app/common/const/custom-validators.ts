import {
	AbstractControl,
	FormArray,
	FormControl,
	FormGroup,
	ValidationErrors,
	ValidatorFn,
	Validators,
} from '@angular/forms';

// export function markFormGroupTouched(formGroup: FormGroup) {
//   Object.values(formGroup.controls).forEach(control => {
//     control.markAsTouched();

//     if (!control.valid) {
//       console.log('invlid control: ', control, 'errors: ', control.errors, 'formGroup: ', formGroup);
//     }

//     if (control instanceof FormGroup) {
//       markFormGroupTouched(control);
//     }
//     else if (control instanceof FormArray) {
//       control.controls.forEach(c => {
//         if (c instanceof FormGroup) {
//           markFormGroupTouched(c);
//         }
//       });
//     }
//   });
// }

export function markFormGroupTouched(formGroup: FormGroup | FormArray) {
	if (!formGroup) return;

	Object.values(formGroup.controls).forEach((control) => {
		if (!control) return;

		if (control instanceof FormControl) {
			control.markAsTouched();
		} else if (control instanceof FormGroup || control instanceof FormArray) {
			markFormGroupTouched(control);
		}
	});
	formGroup.markAsTouched();
}

export const AcceptedFileTypes = [
	'image/*',
	'.doc',
	'.docx',
	'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'.csv',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'application/vnd.ms-excel',
	'.pdf',
];

export function noWhitespaceValidator(control: FormControl) {
	const isWhitespace = (control.value || '').trim().length === 0;
	const isValid = !isWhitespace;
	return isValid ? null : { whitespace: true };
}

export function passwordValidator(control: AbstractControl): ValidationErrors | null {
	const password = control.value;
	const hasSmallLetter = /[a-z]/.test(password);
	const hasCapitalLetter = /[A-Z]/.test(password);
	const hasNumber = /\d/.test(password);
	if (!hasSmallLetter || !hasCapitalLetter || !hasNumber) {
		return { weakPassword: true };
	}
	return null;
}

export function detailedPasswordValidator(): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		const value = control.value || '';

		// בדוק את כל החוקים
		const hasUpperCase = /[A-Z]/.test(value);
		const hasLowerCase = /[a-z]/.test(value);
		const hasNumeric = /[0-9]/.test(value);
		const isLongEnough = value.length >= 8;

		// צור אובייקט שגיאות
		const errors: ValidationErrors = {};
		if (!hasUpperCase) errors['noUpperCase'] = true;
		if (!hasLowerCase) errors['noLowerCase'] = true;
		if (!hasNumeric) errors['noNumeric'] = true;
		if (!isLongEnough) errors['minLength'] = true; // אפשר להשתמש בזה במקום ב-minLength המובנה

		// החזר את האובייקט רק אם יש בו שגיאות
		return Object.keys(errors).length > 0 ? errors : null;
	};
}

export const phoneValidator: ValidatorFn = Validators.pattern('^0[0-9]{8,9}$');
// export const landLineValidator: ValidatorFn = Validators.pattern('^0[0-9]{8}$');
export const mobileValidator: ValidatorFn = Validators.pattern('^0[0-9]{9}$');
// export const israeliMobileValidator: ValidatorFn = Validators.pattern('^0?(5[024])(-)?[0-9]{7}$');
// export const phoneValidator: ValidatorFn = Validators.pattern('[[0][0-9]{9}]*');
export const israeliMobileValidator: ValidatorFn = Validators.pattern('^0?(5[024])(-)?[0-9]{7}$');
export const englishOnlyValidator: ValidatorFn = Validators.pattern('[a-zA-z0-9]*');
export const urlValidator: ValidatorFn = Validators.pattern('^(http|https)://[^ "]+$');
export const emailValidator: ValidatorFn = Validators.pattern(
	'^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$',
); // Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$');
export const noHebrewValidator: ValidatorFn = Validators.pattern('^[^א-ת]*$');
// export const hebrewCharacterValidator: ValidatorFn = Validators.pattern('[\u0590-\u05FF]');

export function dateRangeValidator(minKeys: string[], maxKeys?: string[]): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		const formGroup = control.parent;
		if (!formGroup) return null;

		const controlDate = control.value;

		// Check min dates
		if (minKeys && minKeys.length) {
			let minError = null;
			minKeys.forEach((minKey) => {
				const minDate = formGroup.get(minKey)?.value;

				if (minDate && controlDate && new Date(controlDate) < new Date(minDate)) {
					minError = {
						dateRange: {
							message: `הזן תאריך גדול מ${FormControlLabels[minKey as keyof typeof FormControlLabels]}`,
						},
					};
				}
			});
			if (minError) return minError;
		}

		// Check max dates
		if (maxKeys && maxKeys.length) {
			let maxError = null;
			maxKeys.forEach((maxKey) => {
				let maxDate;
				if (maxKey === 'today') {
					maxDate = new Date();
					maxDate.setHours(0, 0, 0, 0);
				} else {
					maxDate = formGroup.get(maxKey)?.value;
				}

				if (maxDate && controlDate && new Date(controlDate) > new Date(maxDate)) {
					const message =
						maxKey === 'today'
							? 'הזן תאריך קטן מהיום'
							: `הזן תאריך קטן מ${FormControlLabels[maxKey as keyof typeof FormControlLabels]}`;
					maxError = { dateRange: { message } };
				}
			});
			if (maxError) return maxError;
		}

		return null;
	};
}

export const FormControlLabels = {
	// apartment form
	contractStartDate: 'ת.תחילת תוקף',
	contractEndDate: 'ת.סיום חוזה',
	evacuationDate: 'ת. פינוי',

	//apartmentPayment
	startPeriod: 'תחילת תקופה',

	// worker form
	today: 'היום',
	birthDate: 'ת.לידה',
	entranceDate: 'ת.כניסה',
	lastEntranceDate: 'ת.כניסה קודם',
	exitDate: 'ת.יציאה',
	lastExitDate: 'ת.יציאה קודם',
	escapeDate: 'ת.בריחה',
	startWorkDate: 'ת.תחילת עבודה',
	endWorkDate: 'ת.סיום עבודה',
	resignNoticeDate: 'ת.הודעת פיטורין',
	resignationDate: 'ת.פיטורין',
	passportExpiryDate: 'ת.תוקף דרכון',
	visaIssueDate: 'ת.הוצאת ויזה',
	visaExpiryDate: 'ת.תפוגת ויזה',

	// generalWorkerForm
	plannedReturnDateForInterVisa: 'ת.חזרה',
	plannedLeaveDateForInterVisa: 'ת.יציאה',
	// contractStartDate: 'ת.תחילת חוזה',

	// additionalDetailsForm
	performedAtDate: 'ת.ביצוע',
	// healthForm
	insuranceStartDate: 'ת.תחילת ביטוח',
	insuranceCardValidFromDate: 'תחילת תוקף כרטיס',
};

export function conditionalRequiredValidator(config: ConditionalRequiredConfig): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		const group = control as FormGroup;
		const dependentFieldValue = group.get(config.dependentField)?.value;

		config.fieldsToValidate.forEach((fieldName) => {
			const field = group.get(fieldName);
			if (dependentFieldValue) {
				field?.setValidators([Validators.required]);
			} else {
				field?.clearValidators();
			}
			field?.updateValueAndValidity({ onlySelf: true });
		});

		return null;
	};
}

interface ConditionalRequiredConfig {
	dependentField: string;
	fieldsToValidate: string[];
}

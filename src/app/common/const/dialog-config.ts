export const DialogConfig = {
	width: '100%',
	// height: 'fit-content',
	modal: true,
	draggable: true,
	// resizable: true,
	closable: true,
	dismissableMask: true,
	appendTo: 'body',
	// מאפייני נגישות
	a11yCloseLabel: 'סגור',
	focusOnShow: false,
	autofocus: true,
	

	// חוויית משתמש משופרת
	closeOnEscape: true,
	baseZIndex: 1000,
	showHeader: true,

	// מיקום וגודל
	position: 'center',
	// contentStyle: { padding: '1.25rem' },

	// // התאמה לפי גודל מסך
	// breakpoints: {
	//   '960px': '75vw',
	//   '640px': '90vw'
	// },

	// התאמה אישית
	styleClass: 'p-dialog',
	// style: { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' },

	style: {
		'max-width': '400px',
		'min-width': '300px'
	},

	// אנימציה (תלוי בגרסה)
	// transitionOptions: '400ms cubic-bezier(0.25, 0.8, 0.25, 1)',
};


export const DialogConfigWide = {
	...DialogConfig,
	style: {
		'max-width': '800px',
		'min-width': '360px'
	},
}


export const ConfirmDialogConfig = {
	...DialogConfig,
	header: 'אישור',
	icon: 'pi pi-exclamation-triangle',
	acceptLabel: 'אישור',
	rejectLabel: 'ביטול',
	acceptIcon: 'pi pi-check',
	rejectIcon: 'pi pi-times',
	acceptButtonStyleClass: 'p-button-primary',
	rejectButtonStyleClass: 'p-button-secondary',
};

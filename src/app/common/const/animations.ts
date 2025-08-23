import {
	trigger,
	transition,
	style,
	animate,
	state,
	query,
	stagger,
	group,
} from '@angular/animations';

export const bgError = trigger('bgErrorChange', [
	state(
		'true',
		style({
			backgroundColor: '#fee2e2', // Set the background color when the boolean is true
		}),
	),
	state(
		'false',
		style({
			backgroundColor: 'transparent', // Set the background color when the boolean is false
		}),
	),
	transition('false <=> true', [animate('0.5s')]),
]);

export const ExpandDetailsRow = trigger('detailExpand', [
	state('collapsed,void', style({ height: '0px', minHeight: '0' })),
	state('expanded', style({ height: '*' })),
	transition('expanded <=> collapsed', animate('600ms ease-in-out')),
]);

export const ExpandDetailsRowOnEnter = trigger('detailExpand', [
	transition(':enter', [
		style({ height: '0px', minHeight: '0' }),
		animate('500ms ease-in-out', style({ height: '*' })),
	]),
	transition(':leave', [animate('100ms', style({ height: '0px', minHeight: '0' }))]),
]);

export const fade = trigger('fade', [
	transition(':enter', [style({ opacity: 0 }), animate('500ms', style({ opacity: 1 }))]),
	transition(':leave', [animate('0ms', style({ opacity: 0 }))]),
]);

export const slideInTop = trigger('slideInTop', [
	transition(':enter', [
		style({ transform: 'translateY(-25%)', opacity: 0 }),
		animate('0.5s ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
	]),
	transition(':leave', [
		animate('0.2s ease-in', style({ transform: 'translateY(-100%)', opacity: 0 })),
	]),
]);

export const slideInTop100 = trigger('slideInTop', [
	transition(':enter', [
		style({ transform: 'translateY(50%)', opacity: 0 }),
		animate('0.5s ease-out', style({ transform: 'translateY(100%)', opacity: 1 })),
	]),
	transition(':leave', [
		animate('0.2s ease-in', style({ transform: 'translateY(50%)', opacity: 0 })),
	]),
]);

export const slideUp = trigger('slideUp', [
	transition(':enter', [
		style({ transform: 'translateY(75%)', opacity: 0 }),
		animate('0.5s ease-out', style({ transform: 'translateY(120%)', opacity: 1 })),
	]),
	transition(':leave', [
		animate('0.2s ease-in', style({ transform: 'translateY(0)', opacity: 0 })),
	]),
]);

export const expandShrink = trigger('expandShrink', [
	state(
		'expand',
		style({
			maxHeight: '800px', // adjust the maxHeight as needed
			opacity: 1,
			overflow: 'auto',
		}),
	),
	state(
		'shrink',
		style({
			maxHeight: '0',
			opacity: 0,
			overflow: 'hidden',
		}),
	),
	transition('expand <=> shrink', [animate('0.3s ease-in-out')]),
]);

export const fadeInOut = trigger('fadeInOut', [
	transition(':enter', [style({ opacity: 0 }), animate('300ms ease-in', style({ opacity: 1 }))]),
	transition(':leave', [animate('200ms ease-out', style({ opacity: 0 }))]),
]);

export const fadeIn400 = trigger('fadeIn400', [
	state('void', style({ opacity: '0' })), // Initial state, above the viewport
	state('*', style({ opacity: '1' })), // Final state, within the viewport
	transition('void => *', animate('400ms cubic-bezier(0.10, 0.1, 0.27, 1.1)')), // Enter animation
	transition('* => void', animate('100ms ease-out')), // Exit animation
]);

export const fadeIn1000 = trigger('fadeIn1000', [
	state('void', style({ opacity: '0' })), // Initial state, above the viewport
	state('*', style({ opacity: '1' })), // Final state, within the viewport
	transition('void => *', animate('1000ms ease-in')), // Enter animation
	transition('* => void', animate('1000ms ease-out')), // Exit animation
]);

export const fadeOut200 = trigger('fadeOut200', [
	// transition(':enter', [
	//   style({ opacity: 0 }),
	//   animate('200ms cubic-bezier(0.10, 0.1, 0.27, 1.1)', style({ opacity: '1' }))
	// ]),
	transition(
		':leave',
		animate('200ms cubic-bezier(0.10, 0.1, 0.27, 1.1)', style({ opacity: '0' })),
	), // Exit animation
]);

export const popupAnimation = trigger('popupAnimation', [
	state('void', style({ opacity: '0.1', scale: 0, left: '50%', top: '25%' })),
	state('*', style({ opacity: '1', scale: 1 })),
	transition('void => *', animate('500ms cubic-bezier(0.10, 1.1, 0.27, 1.1)')),
	transition('* => void', animate('5000ms cubic-bezier(0.10, 1.1, 0.27, 1.1)')),
]);

export const opacityAndScale = trigger('opacityAndScale', [
	state('void', style({ opacity: '0', scale: 0.1 })), // Initial state, above the viewport
	state('*', style({ opacity: '1', scale: 1 })), // Final state, within the viewport
	transition('void => *', animate('300ms ease-in')), // Enter animation
	transition('* => void', animate('300ms ease-out')), // Exit animation
]);

export const slideTopToBottomAnimation = trigger('slideTopToBottom', [
	state(
		'void',
		style({
			transform: 'translateY(-50%)',

			opacity: 0,
		}),
	), // Initial state, above the viewport
	state(
		'*',
		style({
			transform: 'translateY(0)',

			opacity: 1,
		}),
	), // Final state, within the viewport
	transition('void => *', animate('300ms ease-in')), // Enter animation
	transition('* => void', animate('300ms ease-out')), // Exit animation
]);

export const slideBottomToTopAnimation = trigger('slideBottomToTop', [
	state('void', style({ transform: 'translateY(100%)', scale: '0' })), // Initial state, above the viewport
	state('*', style({ transform: 'translateY(0)', scale: '1' })), // Final state, within the viewport
	transition('void => *', animate('500ms ease-in')), // Enter animation
	transition('* => void', animate('500ms ease-out')), // Exit animation
]);

export const slideRightToLeftAnimation = trigger('slideRightToLeft', [
	state('void', style({ transform: 'translateX(100%)' })), // Initial state, to the right of the viewport
	state('*', style({ transform: 'translateX(0)' })), // Final state, within the viewport
	transition('void => *', animate('500ms ease-in')), // Enter animation (from right to left)
	transition('* => void', animate('500ms ease-out')), // Exit animation (from left to right)
]);

export const slideLeftToRightAnimation = trigger('slideLeftToRight', [
	state('void', style({ transform: 'translateX(-50%)', opacity: 0 })),
	state('*', style({ transform: 'translateX(0%)', opacity: 1 })),
	transition('void => *', animate('400ms cubic-bezier(0.10, 0.1, 0.27, 1.1)')),
	transition('* => void', animate('400ms cubic-bezier(0.10, 0.1, 0.27, 1.1)')),
]);

export const slideRight = trigger('slideRight', [
	state('void', style({ transform: 'translateX(-300%)', opacity: 0 })), // Initial state, element is not in the DOM
	transition(':enter', [
		animate('1s ease-in-out', style({ transform: 'translateX(0)', opacity: 1 })), // Animation for entering the DOM
	]),
	transition('* => void', [
		// Animation for leaving the DOM
		animate('1s ease-in-out', style({ transform: 'translateY(-300%)', opacity: 0 })),
	]),
]);

export const slideDown = trigger('slideDown', [
	state('void', style({ transform: 'translateY(-60%)', opacity: 0 })), // Initial state, above the viewport
	state('*', style({ transform: 'translateY(0)', opacity: 100 })), // Final state, within the viewport
	transition('void => *', animate('200ms ease-in')), // Enter animation
	transition('* => void', animate('200ms ease-out')), // Exit animation
]);

export const slideDownAndScale60 = trigger('slideDownAndScale60', [
	state('void', style({ transform: 'translateY(0%)', scale: 0.1 })), // Initial state, above the viewport
	state('*', style({ transform: 'translateY(60%)', scale: 1 })), // Final state, within the viewport
	transition('void => *', animate('500ms ease-in')), // Enter animation
	transition('* => void', animate('500ms ease-out')), // Exit animation
]);

export const expandCollapse = trigger('expandCollapse', [
	state(
		'open',
		style({
			height: '*',
			opacity: 1,
		}),
	),
	state(
		'closed',
		style({
			height: '0px',
			opacity: 0,
			overflow: 'hidden',
		}),
	),
	transition('closed => open', [
		style({
			height: '0px',
			opacity: 0,
			overflow: 'hidden',
		}),
		query(
			'.submenu-item',
			[
				style({
					opacity: 0,
					transform: 'translateY(-10px)',
					visibility: 'hidden',
				}),
			],
			{ optional: true },
		),
		group([
			animate(
				'300ms ease-in-out',
				style({
					height: '*',
					opacity: 1,
				}),
			),
			query(
				'.submenu-item',
				[
					style({ visibility: 'visible' }),
					stagger(120, [
						animate(
							'300ms 300ms ease-out',
							style({
								opacity: 1,
								transform: 'translateY(0)',
							}),
						),
					]),
				],
				{ optional: true },
			),
		]),
	]),
	transition('open => closed', [
		style({ overflow: 'hidden' }),
		query(
			'.submenu-item',
			[
				stagger(100, [
					animate(
						'100ms ease-in',
						style({
							opacity: 0,
							transform: 'translateY(-10px)',
						}),
					),
				]),
			],
			{ optional: true },
		),
		animate(
			'100ms ease-in-out',
			style({
				height: '0px',
				opacity: 0,
			}),
		),
	]),
]);

export const staggerMenuItems = trigger('staggerMenuItems', [
	transition('* => *', [
		query(
			':enter',
			[
				style({ opacity: 0, transform: 'translateX(-20px)' }),
				stagger(70, [
					animate(
						'300ms ease-out',
						style({
							opacity: 1,
							transform: 'translateX(0)',
						}),
					),
				]),
			],
			{ optional: true },
		),
	]),
]);

export const crossFade = trigger('crossFade', [
	transition(':enter', [style({ opacity: 0 }), animate('300ms ease-out', style({ opacity: 1 }))]),
	transition(':leave', [animate('200ms ease-in', style({ opacity: 0 }))]),
	// מעבר בין מצבים אחיאים
	transition('* => *', [
		style({ position: 'relative' }),
		query(
			':enter, :leave',
			[
				style({
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
				}),
			],
			{ optional: true },
		),
		query(':enter', [style({ opacity: 0 })], { optional: true }),
		query(':leave', [style({ opacity: 1 })], { optional: true }),
		group([
			query(':leave', [animate('200ms ease-out', style({ opacity: 0 }))], {
				optional: true,
			}),
			query(':enter', [animate('300ms ease-in', style({ opacity: 1 }))], {
				optional: true,
			}),
		]),
	]),
]);

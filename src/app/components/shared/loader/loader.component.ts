import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-loader',
	imports: [CommonModule],
	standalone: true,
	template: `
		<div class="flex justify-center items-center">
			<div class="loader"></div>
		</div>
	`,
	styles: [
		`
			.loader {
				width: 48px;
				height: 48px;
				border: 3px dotted var(--primary-600);
				border-style: solid solid dotted dotted;
				border-radius: 50%;
				display: inline-block;
				position: relative;
				box-sizing: border-box;
				animation: rotation 2s linear infinite;
			}
			.loader::after {
				content: '';
				box-sizing: border-box;
				position: absolute;
				left: 0;
				right: 0;
				top: 0;
				bottom: 0;
				margin: auto;
				border: 3px dotted var(--primary-400);
				border-style: solid solid dotted;
				width: 24px;
				height: 24px;
				border-radius: 50%;
				animation: rotationBack 1s linear infinite;
				transform-origin: center center;
			}

			@keyframes rotation {
				0% {
					transform: rotate(0deg);
				}
				100% {
					transform: rotate(360deg);
				}
			}
			@keyframes rotationBack {
				0% {
					transform: rotate(0deg);
				}
				100% {
					transform: rotate(-360deg);
				}
			}
		`,
	],
})
export class LoaderComponent implements OnInit {
	constructor() {}

	ngOnInit() {}
}

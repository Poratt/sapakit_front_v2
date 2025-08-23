import { Component, OnDestroy, signal, computed, OnInit, effect, untracked, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'count-up',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './count-up.component.css',
  template: `
    <span
      class="count-up"
      [class.counting]="isAnimating()"
      [class.completed]="isCompleted()"
      [class.first-load]="isFirstLoad()"
      [attr.data-theme]="theme()"
      [attr.data-size]="size()"
    >
      {{ formatted() }}
    </span>
  `,
})
export class CountUpComponent implements OnInit, OnDestroy {
  readonly to = input.required<number>();
  readonly from = input<number | null>(null);
  readonly duration = input(1000);
  readonly type = input<'number' | 'percent' | 'currency'>('number');
  readonly decimals = input(0);
  readonly separator = input(',');
  readonly decimalSeparator = input('.');
  readonly prefix = input('');
  readonly suffix = input('');
  readonly easing = input<'linear' | 'easeOut' | 'easeInOut' | 'bounce'>('easeOut');
  readonly theme = input<'default' | 'primary' | 'success' | 'warning' | 'danger' | 'gradient' | 'neon' | 'shadow' | 'dark' | 'matrix'>('default');
  readonly size = input<'small' | 'medium' | 'large' | 'xl'>('medium');
  readonly resetOnChange = input(false);
  readonly withAnimation = input(true);

  private current = signal(0);
  private animationId: number | null = null;

  isAnimating = signal(false);
  isCompleted = signal(false);
  isFirstLoad = signal(true);

  formatted = computed(() => this.format(this.current()));

  ngOnInit(): void {
    setTimeout(() => {
      this.isFirstLoad.set(false);
    }, 500);
  }

  constructor() {
    // The effect now automatically re-runs when `this.to()`'s value changes
    effect(() => {
      // Access the signal value by calling it
      const newTo = this.to();

      if (this.withAnimation()) {
        // Using untracked to prevent the animation logic from creating an unwanted dependency
        untracked(() => {
          const from = this.resetOnChange() ? 0 : this.current();
          this.animate(from, newTo, this.duration());
        });
      } else {
        // If animation is off, just set the final value immediately
        this.current.set(newTo);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  restart(): void {
    this.animate(0, this.to(), this.duration());
  }

  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      this.isAnimating.set(false);
    }
  }

  private animate(from: number, to: number, duration: number): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.isAnimating.set(true);
    this.isCompleted.set(false);

    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = this.applyEasing(progress);
      const value = from + (to - from) * eased;

      this.current.set(value);

      if (progress < 1) {
        this.animationId = requestAnimationFrame(step);
      } else {
        this.animationId = null;
        this.isAnimating.set(false);
        this.isCompleted.set(true);
      }
    };

    this.animationId = requestAnimationFrame(step);
  }

  private applyEasing(progress: number): number {
    // Access the easing signal value
    switch (this.easing()) {
      case 'linear':
        return progress;
      case 'easeOut':
        return 1 - Math.pow(1 - progress, 3);
      case 'easeInOut':
        return progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      case 'bounce':
        return this.bounceEasing(progress);
      default:
        return 1 - Math.pow(1 - progress, 3);
    }
  }

  private bounceEasing(t: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }

  private format(value: number): string {
    // Access the decimals, separator, decimalSeparator, type, prefix, and suffix signal values
    const rounded = this.decimals() > 0 ?
      value.toFixed(this.decimals()) :
      Math.floor(value).toString();

    let formatted = rounded;

    if (this.separator()) {
      const parts = formatted.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.separator());
      formatted = parts.join(this.decimalSeparator());
    }

    switch (this.type()) {
      case 'percent':
        return `${this.prefix()}${formatted}%${this.suffix()}`;
      case 'currency':
        return `${this.prefix()}${formatted}${this.suffix()}`;
      default:
        return `${this.prefix()}${formatted}${this.suffix()}`;
    }
  }
}

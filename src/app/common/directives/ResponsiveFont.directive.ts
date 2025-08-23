import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
  selector: '[appResponsiveFont]',
  standalone: true
})
export class ResponsiveFontDirective implements OnChanges {
  @Input() appResponsiveFont!: string;

  constructor(private el: ElementRef) { }

  ngOnChanges() {
    if (this.appResponsiveFont) {
      this.updateFontSize();
    }


  }
private updateFontSize() {
    const length = this.appResponsiveFont.length;
    const element = this.el.nativeElement;

    // Calculate font size based on text length
    let fontSize = 12; // default (reduced from 13)

    if (length <= 15) fontSize = 12;        // reduced from 13
    else if (length <= 25) fontSize = 11;   // reduced from 12
    else if (length <= 35) fontSize = 10;   // reduced from 11
    else fontSize = 10;                     // reduced from 11

    element.style.fontSize = `${fontSize}px`;
    // element.style.fontWeight = length <= 15 ? '500' : '400';
}
}
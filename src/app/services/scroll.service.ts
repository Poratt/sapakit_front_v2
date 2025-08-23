import { CdkDragMove } from '@angular/cdk/drag-drop';
import { ElementRef, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {

  constructor() { }

  private scrollInterval: any = null;
  private scrollSpeed = 10;
  private scrollThreshold = 50;

  onDragMoved(event: CdkDragMove, content: ElementRef) {
    if (!content) return;

    console.log(content);
    
    const dialogElement = content.nativeElement;
    const rect = dialogElement.getBoundingClientRect();
    const mouseY = event.pointerPosition.y;

    if (mouseY < rect.top + this.scrollThreshold) {
      this.startAutoScroll(-this.scrollSpeed, content);
    } else if (mouseY > rect.bottom - this.scrollThreshold) {
      this.startAutoScroll(this.scrollSpeed, content);
    } else {
      this.stopAutoScroll();
    }
  }

  private startAutoScroll(speed: number, content: ElementRef) {
    this.stopAutoScroll();
    this.scrollInterval = setInterval(() => {
      if (content) {
        content.nativeElement.scrollTop += speed;
      }
    }, 16);
  }

  public stopAutoScroll() {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = null;
    }
  }


}

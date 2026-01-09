import { Directive, ElementRef, Input, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  standalone: false,
  selector: '[allowedSpecialCharacter]'
})
export class AllowedSpecialCharacterDirective {
  @Input() allowedSpecialCharacter: string;
  constructor(private el: ElementRef, private control: NgControl) { }


  @HostListener('keypress', ['$event']) onKeyPress(event) {
    return new RegExp(this.allowedSpecialCharacter).test(event.key);
  }

  @HostListener('paste', ['$event']) blockPaste(event: KeyboardEvent) {
    this.validateFields(event);
  }

  validateFields(event) {
    setTimeout(() => {
      this.el.nativeElement.value = this.el.nativeElement.value.replace(/[^A-Za-z0-9 ]/g, '');
      this.control.control.setValue(this.el.nativeElement.value);
      event.preventDefault();
    },500)
  }
}

import { Component, Input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'sl-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SlInputComponent),
      multi: true
    }
  ],
  template: `
    <div class="w-full">
      <label *ngIf="label" [for]="id" class="block text-sm font-medium text-slate-700 mb-1">
        {{ label }} <span *ngIf="required" class="text-red-500">*</span>
      </label>
      <div class="relative">
        <input
          [id]="id"
          [type]="type"
          [placeholder]="placeholder"
          [value]="value()"
          [disabled]="disabled()"
          (input)="onInput($event)"
          (blur)="onTouched()"
          class="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-night focus:border-night transition-shadow disabled:bg-slate-50 disabled:text-slate-500"
          [ngClass]="{'border-red-500 focus:ring-red-500': error}"
        />
      </div>
      <p *ngIf="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
      <p *ngIf="hint && !error" class="mt-1 text-sm text-slate-500">{{ hint }}</p>
    </div>
  `
})
export class SlInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() id = `sl-input-${Math.random().toString(36).substr(2, 9)}`;
  @Input() required = false;
  @Input() error = '';
  @Input() hint = '';

  value = signal<string>('');
  disabled = signal<boolean>(false);

  onChange: any = () => {};
  onTouched: any = () => {};

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
  }

  writeValue(val: string): void {
    this.value.set(val || '');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}

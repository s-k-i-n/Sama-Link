import { Injectable, signal, OnDestroy } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeService implements OnDestroy {
  private _now = signal(new Date());
  readonly now = this._now.asReadonly();
  private timer: any;

  constructor() {
    this.timer = setInterval(() => {
      this._now.set(new Date());
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}

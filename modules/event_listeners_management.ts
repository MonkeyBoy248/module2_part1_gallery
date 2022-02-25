export interface EventListener {
  target: HTMLElement | Window | Document;
  type: string; 
  handler: EventListenerOrEventListenerObject;
}

export function removeEventListeners (listeners: EventListener[]) {
  for (let listener of listeners) {
    listener.target.removeEventListener(listener.type, listener.handler);
  }
}

// A simple event emitter to broadcast errors globally.
type Listener = (error: any) => void;

class ErrorEmitter {
  private listeners: Map<string, Listener[]> = new Map();

  on(event: string, listener: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  emit(event: string, error: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach((listener) => listener(error));
    }
  }
}

export const errorEmitter = new ErrorEmitter();

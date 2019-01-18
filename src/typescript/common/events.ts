/** IListenableTap is a tap that can have listeners added and removed but
 *  cannot be used to raise events.
 */
export interface IListenableTap<T = void> {
    listen(handler: (payload:T) => void): void;
    remove(handler: (payload:T) => void): void;
}


/** An event tap is an object that allows events to be raised but handlers cannot be 
 * added or removed.
 */
export interface IRaisableTap<T = void> {
    raise(payload:T): void;
}


/** An event tap is an object that allows event handlers to be registered, events to be raised
 * @type T The type of the event payload. Defaults to void if not specified.
 */
export interface ITap<T = void> extends IListenableTap<T>, IRaisableTap<T> { }


/** nullTap is a catch all implementation of ITap that 
 * never registers any handlers and never raises any events.
 */
export const nullTap:ITap<any> = {
    listen({}: (v:any) => void): void { },
    remove({}: (v:any) => void): void { },
    raise({}: any): void { }
};


/** Tab<T> is the concrete implementation if ITap<T>
 * 
 */
export class Tap<T> implements ITap<T> {
    private readonly handlers:Set<(v:T) => void> = new Set();

    listen(handler: (v:T) => void): void { 
        this.handlers.add(handler);
    }

    remove(handler: (v:any) => void): void { 
        this.handlers.delete(handler);
    }

    raise(value: T): void { 
        this.handlers.forEach(h => h(value));
    }
}


/** forward an event from one tap to another.
 *  
 * @param source a tap that can be listened to; the source of the event
 * @param destination a tap that can have events raised on it; the destination of the event
 */
export function forward<T>(source: IListenableTap<T>, destination: IRaisableTap<T>): void {
    source.listen((v) => destination.raise(v));
}


/** Map an event from one tap to another, transforming it in the process
 * 
 * @param source a tap that can be listened to; the source of the event
 * @param destination a tap that can have events raised on it; the destination of the event
 * @param mapping a function to map the event from one type to another
 */
export function map<A, B>(source: IListenableTap<A>, destination: IRaisableTap<B>, mapping:(v:A)=>B): void {
    source.listen((v) => destination.raise(mapping(v)));
}


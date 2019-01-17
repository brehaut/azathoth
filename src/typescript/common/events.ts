export interface ISink<T = void> {
    listen(handler: (v:T) => void): void;
    remove(handler: (v:T) => void): void;
    raise(v:T): void;
}


export const nullSink:ISink<any> = {
    listen({}: (v:any) => void): void { },
    remove({}: (v:any) => void): void { },
    raise({}: any): void { }
};


export class Sink<T> implements ISink<T> {
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
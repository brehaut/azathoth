import { Identifiable, IdentifiableTypes, Id } from "data";
import { ISink, Sink } from "events";

export interface Subscription { 
    readonly onUnsubscribe: ISink;
    unsubscribe(): void;
};

export interface Hub<T extends Identifiable> {
    subscribe(type: IdentifiableTypes<T>, id: number): Promise<Subscription>
}


class NaïveSubscription<T extends Identifiable> implements Subscription {
    readonly onUnsubscribe: ISink = new Sink();

    constructor(private readonly hub: NaïveHub<T>, private readonly type: IdentifiableTypes<T>, private readonly id: Id) {
    
    }

    unsubscribe(): void {
        this.hub.unsubscribe(this.type, this.id);
        this.onUnsubscribe.raise();
    }
}


class NaïveHub<T extends Identifiable<string>> implements Hub<T> {
    async subscribe(type: IdentifiableTypes<T>, id: Id): Promise<Subscription> {
        return new NaïveSubscription(this, type, id);
    }

    /** Used by the subscription object to dispatch the unsubscribe action.
     * 
     * @param type 
     * @param id 
     */
    unsubscribe(type: IdentifiableTypes<T>, id: Id) {
        // TODO
    }
}


function hub<T extends Identifiable<string>>(): Hub<T> {
    return new NaïveHub();
}
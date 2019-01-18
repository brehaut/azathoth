import { Identifiable, IdentifiableTags, IdentifiableTagsToTypes, Id } from "data";
import { ITap, IListenableTap, Tap } from "events";

export interface Subscription<T> { 
    readonly onMessage: IListenableTap<T>;
    readonly onUnsubscribe: IListenableTap;
    unsubscribe(): void;
};


export interface Hub<T extends Identifiable> {
    subscribe<Tag extends IdentifiableTags<T>>(tag:Tag, id: Id): Promise<Subscription<IdentifiableTagsToTypes<T>[Tag]>>
}


class NaïveSubscription<Hub extends Identifiable, Data extends Hub = Hub> implements Subscription<Data> {
    readonly onMessage: ITap<Data> = new Tap();
    readonly onUnsubscribe: ITap = new Tap();

    constructor(private readonly hub: NaïveHub<Hub>, private readonly tag: IdentifiableTags<Data>, private readonly id: Id) {
    
    }

    unsubscribe(): void {
        this.hub.unsubscribe(this.tag, this.id, this);
        this.onUnsubscribe.raise();
    }
}


type PublishBridge<T> = (publish: (payload:T) => void) => void;


class NaïveHub<T extends Identifiable> implements Hub<T> {
    private readonly subscriptions = new Map<IdentifiableTags<T>, Map<Id, Set<NaïveSubscription<T>>>>();

    /**
     *
     */
    constructor(publishBridge:PublishBridge<T>) {
        publishBridge((payload:T) => {
            this.publish(payload);
        });
    }   

    private publish(payload: T) {
        const subscriptions = this.subscriptionsByTagAndId(payload.tag as IdentifiableTags<T>, payload.id);
        subscriptions.forEach(sub => {
            sub.onMessage.raise(payload);
        });
    }

    async subscribe<Tag extends IdentifiableTags<T>>(tag:Tag, id: Id): Promise<Subscription<IdentifiableTagsToTypes<T>[Tag]>> {
        const sub = new NaïveSubscription<T, IdentifiableTagsToTypes<T>[Tag]>(this, tag, id);
        this.subscriptionsByTagAndId(tag, id).add(sub);
        return sub;
    }

    /** Used by the subscription object to dispatch the unsubscribe action.
     * 
     * @param type 
     * @param id
     * @param sub - the object to remove
     */
    unsubscribe(tag: IdentifiableTags<T>, id: Id, sub: NaïveSubscription<T, T>) {
        this.subscriptionsByTagAndId(tag, id).delete(sub);
    }


    // Navigate the subscription structure:

    private subscriptionsByTag(tag: IdentifiableTags<T>): Map<Id, Set<NaïveSubscription<T>>> {
        if (!this.subscriptions.has(tag)) {
            const subs = new Map<Id, Set<NaïveSubscription<T>>>();
            this.subscriptions.set(tag, subs);
            return subs;
        }
        return this.subscriptions.get(tag)!;
    }

    private subscriptionsByTagAndId(tag: IdentifiableTags<T>, id: Id): Set<NaïveSubscription<T>> {
        const byTag = this.subscriptionsByTag(tag);
        if (!byTag.has(id)) {
            const subs = new Set<NaïveSubscription<T>>();
            byTag.set(id, subs);
            return subs;
        }
        return byTag.get(id)!;
    }

}


export function hub<T extends Identifiable>(publishBridge: PublishBridge<T>): Hub<T> {
    return new NaïveHub(publishBridge);
}

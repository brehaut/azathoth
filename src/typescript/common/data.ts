export type Id = number; // This would ideally be a symbol but they need to be transferable across the 
                         // possibly some kind of symbol exchanger would be created.


/** Identifiable is an interface for things that need to be uniquely identifiable
 * via some intrinsic value rather than by reference. This is specifically to simplify 
 * shipping them across a postMessage boundary.
 * 
 * @type TType The string type that uniquely identifies this record type.
 */                         
export interface Identifiable<TType extends string> {
    type: TType;
    id: Id;
}

/** Scenarios are the top level organisational document. 
 * 
 * There isnt really much to a Scenario other than its title and the game
 * it’s for. Currently Game is a completely abstract notion; no special 
 * behaviour is provided for different games.
 */
export interface Scenario extends Identifiable<"scenario"> {
    title: string,
    game: string
};

/** Act is an optional subgrouping mechanism within a scenario. 
 * 
 * It is  intended to simplify scoping GMCs to a subset of available
 * scenes when that is logically useful.
 */
export interface Act extends Identifiable<"act">{
    title: string,
    scenario: Id
    orderKey: number;
};


export interface Scope<T extends Identifiable<string>> {
    type: T extends Identifiable<infer K> ? K : never,
    id: Id
}

export interface Scene extends Identifiable<"scene">{
    title: string,
    scope: Scope<Scenario | Act>
};


/** GmcPoolDefinition defines a pool such Health, Stability, Firearms
 * 
 * This is the maximum rated value, the minimum (for GMCs who have meter pools that
 * can go negative)
 */
export interface GmcPoolDefinition extends Identifiable<"meter"> {
    name: string,
    rating: number,
    minimum: number // typically zero but some meters like health and stability may be -12
}

/**
 * GmcValue defines a static values (either a target number or modifier)
 */
export interface GmcValue {
    name: string,
    type: "threshold" | "modifier",
    value: number
}


/** A GmcPrototype is the definition of a character
 * 
 * This is not the game time state but rather the maximum values.
 * Some Gmc’s are singletons, e.g. specific characters, while others
 * will have multiple instances (such as mooks or monsters). 
 */
export interface GmcPrototype extends Identifiable<"gmcPrototype"> {
    name: string,
    pools: GmcPoolDefinition[]
    values: GmcValue,
    singleton: boolean

    scope: Scope<Scenario | Act | Scene>
}


/** GmcInstance is the live version of the referenced prototype
 * 
 * @property instanceCounter differentiates between multiple instances of the
 *                           GmcPrototype for non-singleton GMCs. 
 * @property poolValues the values of pools defined in the definitions pools 
 *                      property 
 */
export interface GmcInstance extends Identifiable<"gmc"> {
    prototype: Id,
    instanceCounter: number,
    poolValues: Map<Id, number>
}


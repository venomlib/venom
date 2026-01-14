import { AckType } from '../model/enum/index.js';
interface CacheEntry {
    id: AckType | string;
    timestamp: number;
}
export declare class DeduplicationCache {
    private cache;
    private ttlMs;
    private cleanupTimer;
    constructor(ttlMs?: number);
    private startCleanupTimer;
    private removeExpired;
    add(id: AckType | string, serialized: string): boolean;
    has(id: AckType | string, serialized: string): boolean;
    get(serialized: string): CacheEntry | undefined;
    updateId(serialized: string, newId: AckType | string): boolean;
    dispose(): void;
}
export { DeduplicationCache as callbackWile };

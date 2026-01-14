import { Id } from './id.js';
import { GroupChangeEvent } from './enum/index.js';
export interface ParticipantEvent {
    by: Id;
    action: GroupChangeEvent;
    who: [Id];
}

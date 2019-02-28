export interface MentionConfig extends Mentions {
    mentions?: Mentions[];
}
export interface Mentions {
    items?: any[];
    triggerChar?: string;
    labelKey?: string;
    maxItems?: number;
    disableSort?: boolean;
    dropUp?: boolean;
    mentionSelect?: (item: any) => (string);
}

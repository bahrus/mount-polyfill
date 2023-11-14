type CSSMatch = string;
type ImportString = string;
export interface MountInit{
    match: string,
    within: Element | ShadowRoot | DocumentFragment | Node,
    import: ImportString | [ImportString, ImportAssertions]
}
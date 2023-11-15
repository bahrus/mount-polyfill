type CSSMatch = string;
type ImportString = string;
type MediaQuery = string;

export interface ImportContext {
    mountInit: MountInit,
    refs:  readonly WeakRef<Element>[],
    disconnect(): void;

} 
export type PipelineProcessor<ReturnType = void> = (element: Element, ctx: ImportContext) => Promise<ReturnType>
export interface MountInit{
    match: string,
    within: Node,
    intersectionObserverInit?: IntersectionObserverInit,
    mediaMatches?: MediaQuery,
    containerQuery?: MediaQuery,
    actsOn: {
        instanceOf?: Array<typeof Node>, //[TODO] What's the best way to type this?,
        cssMatch?: string,
    },
    import?: ImportString | [ImportString, ImportAssertions] | PipelineProcessor,
    doCallbackIf?: PipelineProcessor<boolean>,
    callback?: PipelineProcessor,
}
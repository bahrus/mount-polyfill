type CSSMatch = string;
type ImportString = string;
type MediaQuery = string;

export interface ImportContext {
    mountInit: MountInit,
    refs:  readonly WeakRef<Element>[],
    disconnect(): void;

} 
export type PipelineProcessor<ReturnType = void> = (matchingElements: Array<Element>, ctx: ImportContext) => Promise<ReturnType>
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
    act?:{
        if?: PipelineProcessor<boolean>,
        do?: PipelineProcessor
    }
}
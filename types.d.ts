type CSSMatch = string;
type ImportString = string;
type MediaQuery = string;

export interface ImportContext {
    mountInit: MountInit,
    refs:  readonly WeakRef<Element>[],
    disconnect(): void;

} 
export type PipelineProcessor<ReturnType = void> = (matchingElement: Element, ctx: ImportContext) => Promise<ReturnType>;
export interface ActionPipeline{
    mountIf: PipelineProcessor<boolean>,
    onMount: PipelineProcessor,

    onDismount: PipelineProcessor,
}
export interface MountInit{
    sift:{
        for: CSSMatch,
        within?: Node,
        havingIntersectionBehavior?: IntersectionObserver,
        matchingMedia: MediaQuery
    }
    do: PipelineProcessor | ActionPipeline,
    intersectionObserverInit?: IntersectionObserverInit,
    containerQuery?: MediaQuery,
    actsOn: {
        instanceOf?: Array<typeof Node>, //[TODO] What's the best way to type this?,
        cssMatch?: string,
    },
    import?: ImportString | [ImportString, ImportAssertions] | PipelineProcessor,
    actionPipeline: ActionPipeline
}
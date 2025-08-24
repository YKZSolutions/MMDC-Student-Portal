export function getChildTypeFromParentType(parentType?: string) {
    if (!parentType) return "module";

    switch (parentType) {
        case "module":
            return "subsection";
        case "subsection":
            return "item";
        default:
            return "module";
    }
}

export function isPastDueDate(date: string) {
    const today = new Date();
    const dueDate = new Date(date);
    return dueDate < today;
}

export function isMissed (date: string){

}

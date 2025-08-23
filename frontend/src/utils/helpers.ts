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


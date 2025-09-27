import path from "path";
import { Project, SyntaxKind } from "ts-morph";
import { execSync } from "child_process";

const GENERATED_GLOB = "../backend/src/generated/nestjs-dto/**/*.ts";
const JSON_ARRAY_FIELDS = ["content, rubricSchema, questionRules"];
const PRISMA_JSON_TYPES = [
    "Json",
    "JsonValue",
    "JsonArray",
    "InputJsonValue",
    "NullableJsonNullValueInput",
];

function isPrismaJsonType(typeText: string) {
    if (!typeText) return false;
    return (
        typeText.includes("Prisma.") &&
        PRISMA_JSON_TYPES.some((t) => typeText.includes(t))
    );
}

async function main() {
    const project = new Project({
        // point at your tsconfig so ts-morph knows project formatting / paths
        tsConfigFilePath: path.resolve("tsconfig.json"),
        skipAddingFilesFromTsConfig: true,
    });

    const files = project.addSourceFilesAtPaths(GENERATED_GLOB);
    let modifiedCount = 0;

    for (const sf of files) {
        let fileChanged = false;

        for (const cls of sf.getClasses()) {
            for (const prop of cls.getProperties()) {
                const name = prop.getName();
                if (!JSON_ARRAY_FIELDS.includes(name)) continue;

                const typeNode = prop.getTypeNode();
                if (!typeNode) continue;
                const typeText = typeNode.getText();
                if (!isPrismaJsonType(typeText)) continue;

                // --------- 1) Ensure ApiProperty has `isArray: true` and a `type` entry ----------
                const apiDec = prop.getDecorator("ApiProperty");
                if (apiDec) {
                    const call = apiDec.getCallExpression();
                    if (call) {
                        const args = call.getArguments();
                        const firstArg = args[0];

                        if (!firstArg) {
                            // no args: replace decorator with an object that has type + isArray
                            apiDec.remove();
                            prop.addDecorator({
                                name: "ApiProperty",
                                arguments: ["{ type: () => Object, isArray: true }"],
                            });
                            fileChanged = true;
                        } else if (firstArg.getKind() === SyntaxKind.ObjectLiteralExpression) {
                            const obj = firstArg.asKindOrThrow(
                                SyntaxKind.ObjectLiteralExpression
                            );
                            // add or set isArray: true
                            const isArrayProp = obj.getProperty("isArray");
                            if (!isArrayProp) {
                                obj.addPropertyAssignment({ name: "isArray", initializer: "true" });
                                fileChanged = true;
                            } else {
                                // ensure initializer is `true`
                                try {
                                    // property exists; set initializer text to true
                                    (isArrayProp as any).setInitializer?.("true");
                                } catch {
                                    // ignore if can't set
                                }
                            }

                            // ensure there is a `type` key; if missing add `type: () => Object`
                            if (!obj.getProperty("type")) {
                                obj.addPropertyAssignment({
                                    name: "type",
                                    initializer: "() => Object",
                                });
                                fileChanged = true;
                            }
                        } else {
                            // ApiProperty has a non-object argument (rare). Replace with object arg
                            apiDec.remove();
                            prop.addDecorator({
                                name: "ApiProperty",
                                arguments: ["{ type: () => Object, isArray: true }"],
                            });
                            fileChanged = true;
                        }
                    }
                } else {
                    // No ApiProperty decorator — add one that includes isArray
                    prop.addDecorator({
                        name: "ApiProperty",
                        arguments: ["{ type: () => Object, isArray: true }"],
                    });
                    fileChanged = true;
                }

                // --------- 2) Collect decorators, ensure IsArray exists and reorder ----------
                // collect current decorators (after ApiProperty changes)
                const currentDecs = prop.getDecorators();
                const decsData = currentDecs.map((d) => {
                    const name = d.getName();
                    const call = d.getCallExpression();
                    const args = call ? call.getArguments().map((a) => a.getText()) : [];
                    return { name, args };
                });

                const hasIsArray = decsData.some((d) => d.name === "IsArray");
                if (!hasIsArray) {
                    // we will insert IsArray
                    decsData.push({ name: "IsArray", args: [] });
                }

                // Create new ordering: ApiProperty, IsOptional, IsArray, then the rest (preserving original relative order)
                const specialOrder = ["ApiProperty", "IsOptional", "IsArray"];
                const newDecs: { name: string; args: string[] }[] = [];

                // add in the special order if present
                for (const n of specialOrder) {
                    const idx = decsData.findIndex((d) => d.name === n);
                    if (idx >= 0) {
                        newDecs.push(decsData[idx]);
                    }
                }

                // append remaining decorators preserving original order
                for (const d of decsData) {
                    if (!specialOrder.includes(d.name)) {
                        // avoid duplicates
                        if (!newDecs.find((nd) => nd.name === d.name && JSON.stringify(nd.args) === JSON.stringify(d.args))) {
                            newDecs.push(d);
                        }
                    }
                }

                // Remove all existing decorators and re-add in new order
                currentDecs.forEach((d) => d.remove());
                for (const d of newDecs) {
                    prop.addDecorator({ name: d.name, arguments: d.args });
                }

                fileChanged = true;
            } // end property loop
        } // end class loop

        // If file changed, ensure imports are present (IsArray, ApiProperty) and save
        if (fileChanged) {
            // ensure ApiProperty import
            let swaggerImport = sf.getImportDeclaration("@nestjs/swagger");
            if (!swaggerImport) {
                sf.addImportDeclaration({
                    moduleSpecifier: "@nestjs/swagger",
                    namedImports: [{ name: "ApiProperty" }],
                });
            } else {
                const hasApi = swaggerImport
                    .getNamedImports()
                    .some((ni) => ni.getName() === "ApiProperty");
                if (!hasApi) swaggerImport.addNamedImport("ApiProperty");
            }

            // ensure IsArray import from class-validator
            let cvImport = sf.getImportDeclaration("class-validator");
            if (!cvImport) {
                sf.addImportDeclaration({
                    moduleSpecifier: "class-validator",
                    namedImports: [{ name: "IsArray" }],
                });
            } else {
                const hasIsArray = cvImport
                    .getNamedImports()
                    .some((ni) => ni.getName() === "IsArray");
                if (!hasIsArray) cvImport.addNamedImport("IsArray");
            }

            // 🔥 auto-format the file to clean imports + indentation
            sf.formatText();

            await sf.save();
            modifiedCount++;
        }
    } // files loop

    console.log("🎨 Running Prettier...");
    execSync("npx prettier --write src/generated/nestjs-dto/**/*.ts", {
        stdio: "inherit",
        cwd: path.resolve("../backend"),
    });

    console.log(
        `✅ Processed ${files.length} file(s). Updated ${modifiedCount} file(s).`
    );
}

main().catch((err) => {
    console.error("❌ Error running patch script:", err);
    process.exit(1);
});

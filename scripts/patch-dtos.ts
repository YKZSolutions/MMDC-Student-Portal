import fs from "fs/promises";
import { glob } from "glob";

// Fields that should always be treated as JSON arrays
const JSON_ARRAY_FIELDS = ["content", "blocks", "sections"];

// Helper function to replace content with proper indentation
function replaceContentField(content: string, field: string): string {
    // Pattern to find the field definition with ApiProperty
    const patterns = [
        // Pattern for @ApiProperty with any parameters
        new RegExp(`(@ApiProperty\\([^)]*\\)\\s+)${field}\\??:\\s*(?:Prisma\\.JsonValue|Json|any|object)(?:\\s*\\|\\s*null)?;`, 'g'),
        // Pattern for just the field with type
        new RegExp(`(\\s*)${field}\\??:\\s*(?:Prisma\\.JsonValue|Json|any|object)(?:\\s*\\|\\s*null)?;`, 'g')
    ];

    for (const pattern of patterns) {
        content = content.replace(
            pattern,
            (match, prefix) => {
                // Preserve the original indentation
                const indent = prefix.match(/^\s*/)?.[0] || '';
                return `${prefix}${field}?: Prisma.JsonArray;`;
            }
        );
    }

    // Ensure the ApiProperty decorator has the correct configuration
    const apiPropertyPattern = new RegExp(`(@ApiProperty\\([^)]*\\)\\s+)${field}\\??:`, 'g');
    content = content.replace(
        apiPropertyPattern,
        `@ApiProperty({ type: () => Object, isArray: true, required: false, nullable: true })\n  ${field}?:`
    );

    return content;
}

async function main() {
    try {
        // Get all TypeScript files in the dtos directory
        const files = await glob("../backend/src/generated/nestjs-dto/**/*.ts");

        for (const file of files) {
            let content = await fs.readFile(file, "utf-8");
            const originalContent = content;

            // Process each field that should be an array
            for (const field of JSON_ARRAY_FIELDS) {
                content = replaceContentField(content, field);
            }

            // Save the file if changes were made
            if (content !== originalContent) {
                await fs.writeFile(file, content);
                console.log(` Patched DTO in ${file}`);
            }
        }
    } catch (error) {
        console.error('Error processing files:', error);
        process.exit(1);
    }
}

main();

import fs from "fs/promises";
import { glob } from "glob";

// Configuration
const DTO_DIR = "../backend/src/generated/nestjs-dto/**/*.ts";

// Prisma JSON types that should be treated as arrays
const PRISMA_JSON_TYPES = [
    'Json',
    'JsonValue',
    'JsonArray',
    'InputJsonValue',
    'NullableJsonNullValueInput'
];

// Checks if a field type is a Prisma JSON type
function isPrismaJsonType(typeText: string): boolean {
    return PRISMA_JSON_TYPES.some(type => 
        typeText.includes(type) && typeText.includes('Prisma.')
    );
}

/**
 * Updates the ApiProperty decorator to include isArray: true
 */
function updateApiProperty(apiProperty: string): string {
    const match = apiProperty.match(/@ApiProperty\(([^)]*)\)/);
    if (!match) return apiProperty;

    let options = match[1].trim();
    
    // Handle empty or simple cases
    if (!options || options === '{}') {
        return '@ApiProperty({ type: () => Object, isArray: true })';
    }

    // Add isArray to existing options
    if (!options.includes('isArray:')) {
        options = options.endsWith('}') 
            ? options.slice(0, -1) + ', isArray: true }' 
            : options + ' isArray: true';
    }

    return `@ApiProperty(${options})`;
}

/**
 * Ensures required imports are present in the file
 */
function ensureImports(content: string): string {
    // Add Prisma import if needed
    if (content.includes('Prisma.') && !content.includes("import { Prisma } from '@prisma/client'")) {
        const lastImport = content.match(/^import.*?;$/gm)?.pop() || '';
        content = content.replace(lastImport, `${lastImport}\nimport { Prisma } from '@prisma/client';`);
    }

    // Add IsArray import if needed
    if (content.includes('@IsArray') && !content.includes("import { IsArray }")) {
        const validatorImport = content.match(/import\s*\{([^}]*)\}\s*from\s*['"]class-validator['"]/);
        
        if (validatorImport) {
            const imports = validatorImport[1].split(',').map(i => i.trim()).filter(Boolean);
            if (!imports.includes('IsArray')) {
                imports.push('IsArray');
                content = content.replace(
                    validatorImport[0],
                    `import { ${imports.join(', ')} } from 'class-validator';`
                );
            }
        } else {
            const lastImport = content.match(/^import.*?;$/gm)?.pop() || '';
            content = content.replace(lastImport, `${lastImport}\nimport { IsArray } from 'class-validator';`);
        }
    }

    return content;
}

/**
 * Processes a single DTO file
 */
async function processFile(file: string): Promise<boolean> {
    let content = await fs.readFile(file, "utf-8");
    const originalContent = content;
    let modified = false;

    // Process each field in the DTO
    const fieldRegex = /(\s*@[^\n]+\n)*\s*(\w+)\??\s*:\s*([^\n;]+);/g;
    let match;
    
    while ((match = fieldRegex.exec(content)) !== null) {
        const [fullMatch, decorators, fieldName, typeText] = match;
        
        // Skip if not a Prisma JSON type
        if (!isPrismaJsonType(typeText)) {
            continue;
        }

        // Add @IsArray() decorator if not present
        if (!decorators?.includes('@IsArray()')) {
            const updatedDecorators = decorators 
                ? `@IsArray()\n  ${decorators.trim()}`
                : '@IsArray()\n  ';
            
            content = content.replace(
                fullMatch,
                fullMatch.replace(decorators || '', updatedDecorators)
            );
            modified = true;
        }

        // Update ApiProperty decorator to include isArray
        if (decorators?.includes('@ApiProperty')) {
            content = content.replace(
                /@ApiProperty\([^)]*\)/g,
                updateApiProperty
            );
        }
    }

    // Add necessary imports if file was modified
    if (modified) {
        content = ensureImports(content);
        await fs.writeFile(file, content);
    }

    return modified;
}

/**
 * Main function to process all DTO files
 */
async function main() {
    try {
        console.log("🚀 Starting DTO update process...");
        const files = await glob(DTO_DIR);
        let updatedCount = 0;

        for (const file of files) {
            try {
                if (await processFile(file)) {
                    console.log(`✅ Updated ${file}`);
                    updatedCount++;
                }
            } catch (error) {
                console.error(`❌ Error processing ${file}:`, error);
            }
        }

        console.log(`\n🎉 Processed ${files.length} files, updated ${updatedCount} files.`);
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

// Run the script
main();

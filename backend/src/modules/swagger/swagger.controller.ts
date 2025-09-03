import { Controller, Get, Inject, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Public } from '@/common/decorators/auth.decorator';
import { StatusBypass } from '@/common/decorators/user-status.decorator';
import archiver from 'archiver';

// Recursively collect referenced schemas
function collectSchemas(schema: any, components: any, collected: Set<string>) {
  if (!schema) return;

  if (schema.$ref) {
    const refName = schema.$ref.replace('#/components/schemas/', '');
    if (!collected.has(refName)) {
      collected.add(refName);
      const refSchema = components.schemas?.[refName];
      if (refSchema) {
        collectSchemas(refSchema, components, collected);
      }
    }
  }

  if (schema.type === 'array' && schema.items) {
    collectSchemas(schema.items, components, collected);
  }

  if (schema.type === 'object' && schema.properties) {
    for (const prop of Object.values(schema.properties)) {
      collectSchemas(prop, components, collected);
    }
  }

  if (schema.allOf)
    schema.allOf.forEach((s: any) => collectSchemas(s, components, collected));
  if (schema.oneOf)
    schema.oneOf.forEach((s: any) => collectSchemas(s, components, collected));
  if (schema.anyOf)
    schema.anyOf.forEach((s: any) => collectSchemas(s, components, collected));
}

@Controller('swaggy')
export class SwaggerController {
  constructor(
    @Inject(HttpService)
    private readonly httpService: HttpService,
  ) {}

  @Get()
  @Public()
  @StatusBypass()
  async downloadAllSpecs(@Req() req: Request, @Res() res: Response) {
    try {
      const host = `${req.protocol}://${req.get('host')}`;
      const swaggerUrl = `${host}/api/json`;

      const response = await lastValueFrom(this.httpService.get(swaggerUrl));
      const fullDoc = response.data;

      const tagGroups: Record<string, any> = {};
      for (const [path, methods] of Object.entries(fullDoc.paths)) {
        for (const [method, details] of Object.entries<any>(methods as any)) {
          const opTags: string[] = details.tags || ['untagged'];

          for (const tag of opTags) {
            if (!tagGroups[tag]) {
              tagGroups[tag] = {
                openapi: fullDoc.openapi,
                info: fullDoc.info,
                paths: {},
                components: { schemas: {} },
                tags: [{ name: tag }],
              };
            }

            if (!tagGroups[tag].paths[path]) {
              tagGroups[tag].paths[path] = {};
            }
            tagGroups[tag].paths[path][method] = details;
          }
        }
      }

      // Collect and prune schemas
      for (const [tag, subdoc] of Object.entries(tagGroups)) {
        const usedSchemas = new Set<string>();

        for (const [path, methods] of Object.entries<any>(subdoc.paths)) {
          for (const details of Object.values<any>(methods)) {
            // Responses
            if (details.responses) {
              for (const resp of Object.values<any>(details.responses)) {
                collectSchemas(
                  resp.content?.['application/json']?.schema,
                  fullDoc.components,
                  usedSchemas,
                );
              }
            }
            // Request body
            if (details.requestBody) {
              collectSchemas(
                details.requestBody.content?.['application/json']?.schema,
                fullDoc.components,
                usedSchemas,
              );
            }
            // Parameters
            if (details.parameters) {
              for (const param of details.parameters) {
                collectSchemas(param.schema, fullDoc.components, usedSchemas);
              }
            }
          }
        }

        // Copy only referenced schemas into components
        for (const schemaName of usedSchemas) {
          subdoc.components.schemas[schemaName] =
            fullDoc.components.schemas[schemaName];
        }
      }

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="swagger-specs.zip"',
      );

      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(res);

      for (const [tag, subdoc] of Object.entries(tagGroups)) {
        archive.append(JSON.stringify(subdoc, null, 2), {
          name: `${tag}.json`,
        });
      }

      await archive.finalize();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

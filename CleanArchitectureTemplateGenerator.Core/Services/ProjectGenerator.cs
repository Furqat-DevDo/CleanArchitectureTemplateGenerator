using System.Text;
using CleanArchitectureTemplateGenerator.Core.Models;
using Newtonsoft.Json;
using Scriban;
using Scriban.Runtime;

namespace CleanArchitectureTemplateGenerator.Core.Services;

public class ProjectGenerator
{
    private readonly string _templatesPath;
        private readonly string _outputPath;
        private readonly ProjectMetadata _metadata;

        public ProjectGenerator(string templatesPath, string outputPath, string metadataJson)
        {
            _templatesPath = templatesPath;
            _outputPath = outputPath;
            _metadata = JsonConvert.DeserializeObject<ProjectMetadata>(metadataJson)
                ?? throw new ArgumentException("Invalid metadata JSON");


        }

        public async Task GenerateAsync()
        {
            Console.WriteLine($"Generating project: {_metadata.ProjectName}");
            
            // Create project structure
            CreateProjectStructure();
            
            // Generate core files for each entity
            await GenerateEntities();
            
            // Generate application layer
            await GenerateApplicationLayer();
            
            // Generate infrastructure layer
            await GenerateInfrastructureLayer();
            
            // Generate presentation layer
            await GeneratePresentationLayer();
            
            // Generate solution file
            GenerateSolutionFile();
            
            Console.WriteLine($"Project generated successfully at {_outputPath}");
        }

        private void CreateProjectStructure()
        {
            var projectPath = Path.Combine(_outputPath, _metadata.ProjectName);
            
            // Create main project directory
            Directory.CreateDirectory(projectPath);
            
            // Create layer directories
            var layers = new[] { "Domain", "Application", "Infrastructure", "Presentation" };
            foreach (var layer in layers)
            {
                var layerPath = Path.Combine(projectPath, layer);
                Directory.CreateDirectory(layerPath);
                
                // Create subdirectories for each layer
                CreateLayerSubdirectories(layer, layerPath);
            }
        }

        private void CreateLayerSubdirectories(string layer, string layerPath)
        {
            var subdirectories = layer switch
            {
                "Domain" => new[] { "Entities", "Interfaces", "Exceptions" },
                "Application" => new[] { "Commands", "Queries", "DTOs", "Interfaces", "Common" },
                "Infrastructure" => new[] { "Persistence", "Services", "Data", "Migrations" },
                "Presentation" => new[] { "Controllers", "Middleware", "Extensions" },
                _ => Array.Empty<string>()
            };

            foreach (var subdir in subdirectories)
            {
                Directory.CreateDirectory(Path.Combine(layerPath, subdir));
            }
        }

        private async Task GenerateEntities()
        {
            Console.WriteLine("Generating entities...");
            
            foreach (var entity in _metadata.Entities)
            {
                Console.WriteLine($"  Generating {entity.Name}...");
                
                // Generate domain entity - use simple anonymous objects
                await GenerateFile("Domain/Entity.sbn",
                    Path.Combine(_metadata.ProjectName, "Domain", "Entities", $"{entity.Name}.cs"),
                    new {
                        project_name = _metadata.ProjectName,
                        entity = new {
                            name = entity.Name,
                            properties = entity.Properties.Select(p => new {
                                name = p.Name,
                                type = p.Type,
                                is_key = p.IsKey,
                                required = p.Required
                            }).ToList()
                        },
                        options = _metadata.Options
                    });

                // Generate DTO
                await GenerateFile("Application/Dtos/Dto.sbn",
                    Path.Combine(_metadata.ProjectName, "Application", "DTOs", $"{entity.Name}Dto.cs"),
                    new {
                        project_name = _metadata.ProjectName,
                        entity = new {
                            name = entity.Name,
                            properties = entity.Properties.Select(p => new {
                                name = p.Name,
                                type = p.Type,
                                is_key = p.IsKey,
                                required = p.Required
                            }).ToList()
                        },
                        options = _metadata.Options
                    });

                // Generate repository interface
                await GenerateFile("Domain/Interfaces/IRepository.sbn",
                    Path.Combine(_metadata.ProjectName, "Domain", "Interfaces", $"I{entity.Name}Repository.cs"),
                    new Dictionary<string, object>
                    {
                        ["project_name"] = _metadata.ProjectName,
                        ["entity"] = new Dictionary<string, object>
                        {
                            ["name"] = entity.Name,
                            ["properties"] = entity.Properties.Where(p => p != null).Select(p => new Dictionary<string, object>
                            {
                                ["name"] = p.Name,
                                ["type"] = p.Type,
                                ["is_key"] = p.IsKey,
                                ["required"] = p.Required
                            }).ToArray()
                        },
                        ["options"] = _metadata.Options
                    });
            }
        }

        private async Task GenerateApplicationLayer()
        {
            Console.WriteLine("Generating application layer...");
            
            foreach (var entity in _metadata.Entities)
            {
                // Generate commands and handlers
                foreach (var command in entity.Commands)
                {
                    await GenerateFile("Application/Commands/CommandHandler.sbn",
                        Path.Combine(_metadata.ProjectName, "Application", "Commands", $"{entity.Name}s", $"{command.Name}Command.cs"),
                        new Dictionary<string, object>
                        {
                            ["project_name"] = _metadata.ProjectName,
                            ["entity"] = new Dictionary<string, object>
                            {
                                ["name"] = entity.Name,
                                ["properties"] = entity.Properties.Where(p => p != null).Select(p => new Dictionary<string, object>
                                {
                                    ["name"] = p.Name,
                                    ["type"] = p.Type,
                                    ["is_key"] = p.IsKey,
                                    ["required"] = p.Required
                                }).ToArray()
                            },
                            ["command"] = new Dictionary<string, object>
                            {
                                ["name"] = command.Name,
                                ["type"] = command.Type,
                                ["result_type"] = command.ResultType
                            },
                            ["options"] = _metadata.Options
                        });
                }

                // Generate queries and handlers
                foreach (var query in entity.Queries)
                {
                    await GenerateFile("Application/Queries/QueryHandler.sbn",
                        Path.Combine(_metadata.ProjectName, "Application", "Queries", $"{entity.Name}s", $"{query.Name}Query.cs"),
                        new Dictionary<string, object>
                        {
                            ["project_name"] = _metadata.ProjectName,
                            ["entity"] = new Dictionary<string, object>
                            {
                                ["name"] = entity.Name,
                                ["properties"] = entity.Properties.Where(p => p != null).Select(p => new Dictionary<string, object>
                                {
                                    ["name"] = p.Name,
                                    ["type"] = p.Type,
                                    ["is_key"] = p.IsKey,
                                    ["required"] = p.Required
                                }).ToArray()
                            },
                            ["query"] = new Dictionary<string, object>
                            {
                                ["name"] = query.Name,
                                ["type"] = query.Type,
                                ["result_type"] = query.ResultType
                            },
                            ["options"] = _metadata.Options
                        });
                }
            }
        }

        private async Task GenerateInfrastructureLayer()
        {
            Console.WriteLine("Generating infrastructure layer...");
            
            foreach (var entity in _metadata.Entities)
            {
                // Generate repository implementation
                await GenerateFile("Infrastructure/Persistance/Repository.sbn",
                    Path.Combine(_metadata.ProjectName, "Infrastructure", "Persistence", $"{entity.Name}Repository.cs"),
                    new Dictionary<string, object>
                    {
                        ["project_name"] = _metadata.ProjectName,
                        ["entity"] = new Dictionary<string, object>
                        {
                            ["name"] = entity.Name,
                            ["properties"] = entity.Properties.Where(p => p != null).Select(p => new Dictionary<string, object>
                            {
                                ["name"] = p.Name,
                                ["type"] = p.Type,
                                ["is_key"] = p.IsKey,
                                ["required"] = p.Required
                            }).ToArray()
                        },
                        ["options"] = _metadata.Options
                    });
            }
        }

        private async Task GeneratePresentationLayer()
        {
            Console.WriteLine("Generating presentation layer...");
            
            foreach (var entity in _metadata.Entities)
            {
                // Generate controller
                await GenerateFile("Presentation/Controllers/Controller.sbn",
                    Path.Combine(_metadata.ProjectName, "Presentation", "Controllers", $"{entity.Name}sController.cs"),
                    new Dictionary<string, object>
                    {
                        ["project_name"] = _metadata.ProjectName,
                        ["entity"] = new Dictionary<string, object>
                        {
                            ["name"] = entity.Name,
                            ["properties"] = entity.Properties.Where(p => p != null).Select(p => new Dictionary<string, object>
                            {
                                ["name"] = p.Name,
                                ["type"] = p.Type,
                                ["is_key"] = p.IsKey,
                                ["required"] = p.Required
                            }).ToArray()
                        },
                        ["options"] = _metadata.Options
                    });
            }
        }

        private async Task GenerateFile(string templateName, string relativeOutputPath, object model)
        {
            var templatePath = Path.Combine(_templatesPath, templateName);
            if (!File.Exists(templatePath))
            {
                Console.WriteLine($"  Warning: Template not found: {templatePath}");
                return;
            }



            var templateContent = await File.ReadAllTextAsync(templatePath);
            var template = Template.Parse(templateContent);
            
            // Create script object with model and helper functions
            var scriptObject = new ScriptObject();
            scriptObject.Import(model);

            // Register custom functions as global functions
            scriptObject.Import("map_csharp_type", new Func<string, string>(TemplateHelper.MapCSharpType));
            scriptObject.Import("string_downcase_first", new Func<string, string>(TemplateHelper.StringDowncaseFirst));
            scriptObject.Import("default_value", new Func<string, string, string>(TemplateHelper.DefaultValue));

            var context = new TemplateContext();
            context.PushGlobal(scriptObject);

            var result = await template.RenderAsync(context);
            
            var outputPath = Path.Combine(_outputPath, relativeOutputPath);
            Directory.CreateDirectory(Path.GetDirectoryName(outputPath) ?? throw new InvalidOperationException());
            await File.WriteAllTextAsync(outputPath, result);
            
            Console.WriteLine($"    Generated: {relativeOutputPath}");
        }

        private void GenerateSolutionFile()
        {
            var slnContent = GenerateSolutionContent();
            var slnPath = Path.Combine(_outputPath, $"{_metadata.ProjectName}.sln");
            File.WriteAllText(slnPath, slnContent);
            Console.WriteLine($"Generated solution file: {_metadata.ProjectName}.sln");
        }

        private string GenerateSolutionContent()
        {
            // Generate a basic solution file structure
            var sb = new StringBuilder();
            sb.AppendLine("Microsoft Visual Studio Solution File, Format Version 12.00");
            sb.AppendLine("# Visual Studio Version 17");
            sb.AppendLine("VisualStudioVersion = 17.0.31903.59");
            sb.AppendLine("MinimumVisualStudioVersion = 10.0.40219.1");
            sb.AppendLine();
            
            // Add project entries (simplified)
            var projectGuids = new Dictionary<string, string>
            {
                ["Domain"] = Guid.NewGuid().ToString("B").ToUpper(),
                ["Application"] = Guid.NewGuid().ToString("B").ToUpper(),
                ["Infrastructure"] = Guid.NewGuid().ToString("B").ToUpper(),
                ["Presentation"] = Guid.NewGuid().ToString("B").ToUpper()
            };

            foreach (var project in projectGuids)
            {
                sb.AppendLine($"Project(\"{{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}}\") = \"{_metadata.ProjectName}.{project.Key}\", \"{_metadata.ProjectName}\\{project.Key}\\{_metadata.ProjectName}.{project.Key}.csproj\", \"{project.Value}\"");
                sb.AppendLine("EndProject");
            }

            sb.AppendLine();
            sb.AppendLine("Global");
            sb.AppendLine("	GlobalSection(SolutionConfigurationPlatforms) = preSolution");
            sb.AppendLine("		Debug|Any CPU = Debug|Any CPU");
            sb.AppendLine("		Release|Any CPU = Release|Any CPU");
            sb.AppendLine("	EndGlobalSection");
            sb.AppendLine("	GlobalSection(ProjectConfigurationPlatforms) = postSolution");
            
            foreach (var project in projectGuids)
            {
                sb.AppendLine($"		{project.Value}.Debug|Any CPU.ActiveCfg = Debug|Any CPU");
                sb.AppendLine($"		{project.Value}.Release|Any CPU.ActiveCfg = Release|Any CPU");
            }
            
            sb.AppendLine("	EndGlobalSection");
            sb.AppendLine("	GlobalSection(SolutionProperties) = preSolution");
            sb.AppendLine("		HideSolutionNode = FALSE");
            sb.AppendLine("	EndGlobalSection");
            sb.AppendLine("EndGlobal");

            return sb.ToString();
        }
}
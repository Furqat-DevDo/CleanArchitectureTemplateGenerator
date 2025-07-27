using System.CommandLine;
using CleanArchitectureTemplateGenerator.Core.Services;

internal class Program
{
    static async Task<int> Main(string[] args)
    {
        var metadataOption = new Option<string>(
            "--metadata",
            "Path to metadata JSON file")
        {
            IsRequired = true
        };
        metadataOption.AddAlias("-m");

        var outputOption = new Option<string>(
            "--output",
            "Output directory")
        {
            IsRequired = true
        };
        outputOption.AddAlias("-o");

        var templatesOption = new Option<string>(
            "--templates",
            "Templates directory")
        {
            IsRequired = true
        };
        templatesOption.AddAlias("-t");

        var rootCommand = new RootCommand("Clean Architecture Project Generator");
        rootCommand.AddOption(metadataOption);
        rootCommand.AddOption(outputOption);
        rootCommand.AddOption(templatesOption);

        rootCommand.SetHandler(async (string metadata, string output, string templates) =>
        {
            try
            {
                if (!File.Exists(metadata))
                {
                    Console.WriteLine($"Error: Metadata file not found: {metadata}");
                    Environment.Exit(1);
                }

                if (!Directory.Exists(templates))
                {
                    Console.WriteLine($"Error: Templates directory not found: {templates}");
                    Environment.Exit(1);
                }

                var metadataJson = await File.ReadAllTextAsync(metadata);
                var generator = new ProjectGenerator(templates, output, metadataJson);
                await generator.GenerateAsync();

                Console.WriteLine($"Project generated successfully at {output}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                Environment.Exit(1);
            }
        }, metadataOption, outputOption, templatesOption);

        return await rootCommand.InvokeAsync(args);
    }
}
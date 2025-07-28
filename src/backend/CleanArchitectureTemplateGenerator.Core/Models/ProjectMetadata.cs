using Newtonsoft.Json;

namespace CleanArchitectureTemplateGenerator.Core.Models;

public class ProjectMetadata
{
    [JsonProperty("projectName")]
    public string ProjectName { get; set; } = string.Empty;

    [JsonProperty("entities")]
    public List<EntityMetadata> Entities { get; set; } = new();

    [JsonProperty("options")]
    public GenerationOptions Options { get; set; } = new();
}
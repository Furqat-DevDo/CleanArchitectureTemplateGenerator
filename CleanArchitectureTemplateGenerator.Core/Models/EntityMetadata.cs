using Newtonsoft.Json;

namespace CleanArchitectureTemplateGenerator.Core.Models;

public class EntityMetadata
{
    [JsonProperty("name")]
    public string Name { get; set; } = string.Empty;

    [JsonProperty("properties")]
    public List<PropertyMetadata> Properties { get; set; } = new();

    [JsonProperty("commands")]
    public List<CommandMetadata> Commands { get; set; } = new();

    [JsonProperty("queries")]
    public List<QueryMetadata> Queries { get; set; } = new();
}
using Newtonsoft.Json;

namespace CleanArchitectureTemplateGenerator.Core.Models;

public class CommandMetadata
{
    [JsonProperty("name")]
    public string Name { get; set; } = string.Empty;

    [JsonProperty("type")]
    public string Type { get; set; } = string.Empty; // create, update, delete

    [JsonProperty("resultType")]
    public string ResultType { get; set; } = "Unit";
}
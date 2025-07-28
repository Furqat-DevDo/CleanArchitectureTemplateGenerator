using Newtonsoft.Json;

namespace CleanArchitectureTemplateGenerator.Core.Models;

public class QueryMetadata
{
    [JsonProperty("name")]
    public string Name { get; set; } = string.Empty;

    [JsonProperty("type")]
    public string Type { get; set; } = string.Empty; // list, single

    [JsonProperty("resultType")]
    public string ResultType { get; set; } = string.Empty;
}
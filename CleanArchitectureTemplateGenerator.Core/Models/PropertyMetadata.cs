using Newtonsoft.Json;

namespace CleanArchitectureTemplateGenerator.Core.Models;

public class PropertyMetadata
{
    [JsonProperty("name")]
    public string Name { get; set; } = string.Empty;

    [JsonProperty("type")]
    public string Type { get; set; } = string.Empty;

    [JsonProperty("isKey")]
    public bool IsKey { get; set; }

    [JsonProperty("required")]
    public bool Required { get; set; }
}
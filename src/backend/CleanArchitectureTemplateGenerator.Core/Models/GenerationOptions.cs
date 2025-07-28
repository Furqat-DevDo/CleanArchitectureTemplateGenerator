using Newtonsoft.Json;

namespace CleanArchitectureTemplateGenerator.Core.Models;

public class GenerationOptions
{
    [JsonProperty("useFluentValidation")]
    public bool UseFluentValidation { get; set; } = true;

    [JsonProperty("useAutoMapper")]
    public bool UseAutoMapper { get; set; } = true;

    [JsonProperty("useMediatR")]
    public bool UseMediatR { get; set; } = true;

    [JsonProperty("database")]
    public string Database { get; set; } = "EntityFramework";

    [JsonProperty("authentication")]
    public string Authentication { get; set; } = "JWT";
}
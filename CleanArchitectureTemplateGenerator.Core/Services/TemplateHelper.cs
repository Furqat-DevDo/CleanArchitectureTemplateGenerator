namespace CleanArchitectureTemplateGenerator.Core.Services;

public static class TemplateHelper
{
    public static string MapCSharpType(string typeName)
    {
        return typeName switch
        {
            "string" => "string",
            "int" => "int",
            "Guid" => "Guid",
            "decimal" => "decimal",
            "DateTime" => "DateTime",
            "bool" => "bool",
            "double" => "double",
            "float" => "float",
            _ => typeName
        };
    }

    public static string StringDowncaseFirst(string input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        return char.ToLower(input[0]) + input.Substring(1);
    }

    public static string DefaultValue(string input, string defaultValue)
    {
        return string.IsNullOrEmpty(input) ? defaultValue : input;
    }
}
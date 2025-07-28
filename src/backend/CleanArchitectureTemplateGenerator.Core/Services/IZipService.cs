namespace CleanArchitectureTemplateGenerator.Core.Services;

/// <summary>
/// Service interface for zip file operations
/// </summary>
public interface IZipService
{
    /// <summary>
    /// Creates a zip file from a directory
    /// </summary>
    /// <param name="directoryPath">Path to the directory to zip</param>
    /// <returns>Zip file as byte array</returns>
    Task<byte[]> CreateZipFromDirectoryAsync(string directoryPath);

    /// <summary>
    /// Creates a zip file from multiple files
    /// </summary>
    /// <param name="files">Dictionary of file paths and their content</param>
    /// <returns>Zip file as byte array</returns>
    Task<byte[]> CreateZipFromFilesAsync(Dictionary<string, byte[]> files);

    /// <summary>
    /// Extracts a zip file to a directory
    /// </summary>
    /// <param name="zipBytes">Zip file content</param>
    /// <param name="extractPath">Path to extract to</param>
    /// <returns>List of extracted file paths</returns>
    Task<List<string>> ExtractZipToDirectoryAsync(byte[] zipBytes, string extractPath);
}

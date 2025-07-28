using System.IO.Compression;

namespace CleanArchitectureTemplateGenerator.Core.Services;

/// <summary>
/// Service implementation for zip file operations
/// </summary>
public class ZipService : IZipService
{
    public async Task<byte[]> CreateZipFromDirectoryAsync(string directoryPath)
    {
        if (!Directory.Exists(directoryPath))
        {
            throw new DirectoryNotFoundException($"Directory not found: {directoryPath}");
        }

        using var memoryStream = new MemoryStream();
        using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
        {
            await AddDirectoryToArchive(archive, directoryPath, string.Empty);
        }

        return memoryStream.ToArray();
    }

    public async Task<byte[]> CreateZipFromFilesAsync(Dictionary<string, byte[]> files)
    {
        using var memoryStream = new MemoryStream();
        using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
        {
            foreach (var file in files)
            {
                var entry = archive.CreateEntry(file.Key);
                using var entryStream = entry.Open();
                await entryStream.WriteAsync(file.Value);
            }
        }

        return memoryStream.ToArray();
    }

    public async Task<List<string>> ExtractZipToDirectoryAsync(byte[] zipBytes, string extractPath)
    {
        var extractedFiles = new List<string>();

        using var memoryStream = new MemoryStream(zipBytes);
        using var archive = new ZipArchive(memoryStream, ZipArchiveMode.Read);

        foreach (var entry in archive.Entries)
        {
            if (string.IsNullOrEmpty(entry.Name))
            {
                // This is a directory entry
                var dirPath = Path.Combine(extractPath, entry.FullName);
                Directory.CreateDirectory(dirPath);
                continue;
            }

            var filePath = Path.Combine(extractPath, entry.FullName);
            var fileDir = Path.GetDirectoryName(filePath);
            
            if (!string.IsNullOrEmpty(fileDir))
            {
                Directory.CreateDirectory(fileDir);
            }

            using var entryStream = entry.Open();
            using var fileStream = File.Create(filePath);
            await entryStream.CopyToAsync(fileStream);

            extractedFiles.Add(filePath);
        }

        return extractedFiles;
    }

    private async Task AddDirectoryToArchive(ZipArchive archive, string directoryPath, string entryPrefix)
    {
        var directoryInfo = new DirectoryInfo(directoryPath);

        // Add all files in the current directory
        foreach (var file in directoryInfo.GetFiles())
        {
            var entryName = Path.Combine(entryPrefix, file.Name).Replace('\\', '/');
            var entry = archive.CreateEntry(entryName);

            using var entryStream = entry.Open();
            using var fileStream = file.OpenRead();
            await fileStream.CopyToAsync(entryStream);
        }

        // Recursively add subdirectories
        foreach (var subDirectory in directoryInfo.GetDirectories())
        {
            var subEntryPrefix = Path.Combine(entryPrefix, subDirectory.Name).Replace('\\', '/');
            await AddDirectoryToArchive(archive, subDirectory.FullName, subEntryPrefix);
        }
    }
}

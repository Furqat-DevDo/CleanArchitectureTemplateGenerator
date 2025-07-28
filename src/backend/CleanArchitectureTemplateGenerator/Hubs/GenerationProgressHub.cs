using Microsoft.AspNetCore.SignalR;
using CleanArchitectureTemplateGenerator.Core.Models;

namespace CleanArchitectureTemplateGenerator.Hubs;

/// <summary>
/// SignalR Hub for real-time project generation progress updates
/// </summary>
public class GenerationProgressHub : Hub
{
    /// <summary>
    /// Join a specific job group to receive progress updates
    /// </summary>
    /// <param name="jobId">The job ID to track</param>
    public async Task JoinJobGroup(string jobId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"job_{jobId}");
    }

    /// <summary>
    /// Leave a job group
    /// </summary>
    /// <param name="jobId">The job ID to stop tracking</param>
    public async Task LeaveJobGroup(string jobId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"job_{jobId}");
    }

    /// <summary>
    /// Send progress update to all clients tracking a specific job
    /// </summary>
    /// <param name="jobId">Job ID</param>
    /// <param name="progress">Progress information</param>
    public async Task SendProgressUpdate(string jobId, GenerationProgress progress)
    {
        await Clients.Group($"job_{jobId}").SendAsync("ProgressUpdate", progress);
    }

    /// <summary>
    /// Send completion notification to all clients tracking a specific job
    /// </summary>
    /// <param name="jobId">Job ID</param>
    /// <param name="result">Generation result</param>
    public async Task SendCompletionNotification(string jobId, GenerationResult result)
    {
        await Clients.Group($"job_{jobId}").SendAsync("GenerationCompleted", result);
    }

    /// <summary>
    /// Send error notification to all clients tracking a specific job
    /// </summary>
    /// <param name="jobId">Job ID</param>
    /// <param name="error">Error message</param>
    public async Task SendErrorNotification(string jobId, string error)
    {
        await Clients.Group($"job_{jobId}").SendAsync("GenerationError", error);
    }
}

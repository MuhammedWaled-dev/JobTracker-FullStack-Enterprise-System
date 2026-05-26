using System;
using JobTracker.Models.Enums;

namespace JobTracker.Models.Entities
{
    public class TaskItem
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid ProjectId { get; set; }
        public Guid? AssignedUserId { get; set; }
        public JobTracker.Models.Enums.TaskStatus Status { get; set; } = JobTracker.Models.Enums.TaskStatus.Todo;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

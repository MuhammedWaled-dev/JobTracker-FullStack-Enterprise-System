using System;
using JobTracker.Models.Enums;

namespace JobTracker.Models.DTOs
{
    public class TaskDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid ProjectId { get; set; }
        public Guid? AssignedUserId { get; set; }
        public JobTracker.Models.Enums.TaskStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

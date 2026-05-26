using System;

namespace JobTracker.Models.DTOs
{
    public class CreateTaskDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid ProjectId { get; set; }
        public Guid? AssignedUserId { get; set; }
    }
}

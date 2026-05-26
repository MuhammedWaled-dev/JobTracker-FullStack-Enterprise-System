using JobTracker.Models.Enums;

namespace JobTracker.Models.DTOs
{
    public class UpdateTaskStatusDto
    {
        public JobTracker.Models.Enums.TaskStatus Status { get; set; }
    }
}

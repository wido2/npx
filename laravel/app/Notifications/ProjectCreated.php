<?php

namespace App\Notifications;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ProjectCreated extends Notification
{
    use Queueable;

    public function __construct(
        public Project $project,
        public string $createdByName,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Project Baru',
            'message' => "Project {$this->project->kode} - {$this->project->nama} telah dibuat oleh {$this->createdByName}.",
            'action_url' => "/project/{$this->project->id}",
            'action_text' => 'Lihat Project',
            'type' => 'project_created',
        ];
    }
}

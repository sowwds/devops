variable "github_token" {
  type        = string
  description = "The GitHub token for authentication."
  sensitive   = true
}

variable "github_username" {
  type        = string
  description = "The GitHub username of the repository owner."
}

variable "repo_name" {
  type        = string
  description = "The name of the repository."
  default     = "terraform-lab-repo"
}

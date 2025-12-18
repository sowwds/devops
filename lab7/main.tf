terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

provider "github" {
  owner = var.github_username
  token = var.github_token
}

resource "github_repository" "lab_repo" {
  name        = var.repo_name
  description = "Terraform lab repository created for DevOps course."
  visibility  = "public"

  # General settings
  has_issues   = true
  has_projects = true
  has_wiki     = true

  # Merge settings
  allow_merge_commit     = true
  allow_squash_merge     = true
  allow_rebase_merge     = true
  delete_branch_on_merge = true

  # Use MIT license
  license_template = "mit"

  lifecycle {
    prevent_destroy = true
  }
}

resource "github_branch_default" "main" {
  repository = github_repository.lab_repo.name
  branch     = "main"
}

resource "github_branch_protection" "main_protection" {
  repository_id = github_repository.lab_repo.node_id
  pattern       = "main"

  enforce_admins       = true
  allows_deletions     = false
  require_signed_commits = true

  required_pull_request_reviews {
    required_approving_review_count = 1
  }

  required_status_checks {
    strict   = true
    contexts = ["ci/build"]
  }
}

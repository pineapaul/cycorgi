resource "google_iam_workload_identity_pool" "github" {
  provider                  = google
  project                   = "cycorgi-grc-platform"
  workload_identity_pool_id = "github"
  display_name             = "GitHub Pool"
  description              = "Workload Identity Pool for GitHub Actions"
  location                 = "global"
}

resource "google_iam_workload_identity_pool_provider" "github_provider" {
  provider                           = google
  project                            = "cycorgi-grc-platform"
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  location                           = "global"

  display_name = "GitHub Provider"
  description  = "Authenticates GitHub Actions workflows"

  attribute_mapping = {
    "google.subject"         = "assertion.sub"
    "attribute.repository"   = "assertion.repository"
    "attribute.actor"        = "assertion.actor"
  }

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}
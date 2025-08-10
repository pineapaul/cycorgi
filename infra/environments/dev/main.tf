terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.0.0"
    }
  }

  backend "gcs" {
    bucket = "cycorgi-terraform-state"
    prefix = "env/dev"
    impersonate_service_account = "terraform-deployer@cycorgi-grc-platform.iam.gserviceaccount.com"
  }

  required_version = ">= 1.7.0"
}

variable "image_tag" {
  description = "Docker image tag for the Cloud Run service"
  type        = string
}

provider "google" {
  project = "cycorgi-grc-platform"
  region  = "us-central1"
}

resource "google_cloud_run_service" "grc_dev" {
  name     = "grc-dev"
  location = "us-central1"

  template {
    spec {
      service_account_name = "grc-dev-runtime@cycorgi-grc-platform.iam.gserviceaccount.com"
      containers {
        image = "us-central1-docker.pkg.dev/cycorgi-grc-platform/grc-containers/grc-dev:${var.image_tag}"

        ports {
          container_port = 8080
        }
        # --- Secrets from Secret Manager (runtime) ---
        env {
            name = "MONGODB_URI"
          value_from {
            secret_key_ref {
              name = "MONGODB_URI"
              key  = "latest"
            }
          }
        }
        env {
          name = "NEXTAUTH_SECRET"
          value_from {
            secret_key_ref {
              name = "NEXTAUTH_SECRET"
              key  = "latest"
            }
          }
        }
        env {
          name = "GOOGLE_CLIENT_ID"
          value_from {
            secret_key_ref {
              name = "GOOGLE_CLIENT_ID"
              key  = "latest"
            }
          }
        }
        env {
          name = "GOOGLE_CLIENT_SECRET"
          value_from {
            secret_key_ref {
              name = "GOOGLE_CLIENT_SECRET"
              key  = "latest"
            }
          }
        }
        # --- Non-secret runtime env ---
        env {
          name  = "NEXTAUTH_URL"
          value = "https://dev.cycorgi.org"
        }
        env {
          name  = "AUTH_TRUST_HOST"
          value = "true"
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_cloud_run_service_iam_member" "public_access" {
  service  = google_cloud_run_service.grc_dev.name
  location = google_cloud_run_service.grc_dev.location
  project  = google_cloud_run_service.grc_dev.project
  role     = "roles/run.invoker"
  member   = "serviceAccount:grc-dev-invoker@cycorgi-grc-platform.iam.gserviceaccount.com"
}
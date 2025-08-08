terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.0.0"
    }
  }

  backend "gcs" {
    bucket  = "cycorgi-terraform-state"
    prefix  = "env/dev"  # optional folder-like prefix in the bucket
  }

  required_version = ">= 1.7.0"
}

resource "google_cloud_run_service" "grc_dev" {
  name     = "grc-dev"
  location = "us-central1"

  template {
    spec {
      containers {
        image = "us-central1-docker.pkg.dev/cycorgi-grc-platform/grc-containers/grc-dev:latest"
        ports {
          container_port = 8080
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
  role   = "roles/run.invoker"
  member = "serviceAccount:grc-dev-invoker@cycorgi-grc-platform.iam.gserviceaccount.com"
}

provider "google" {
  project = "cycorgi-grc-platform"
  region  = "us-central1"
}
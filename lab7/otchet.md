# Отчет по практической работе №7.1: Управление инфраструктурой GitHub с помощью Terraform

## 1. Цель работы
Целью данной работы было освоение принципов "Инфраструктура как код" (IaC) с использованием Terraform для создания и настройки репозитория на GitHub, включая его основные параметры и правила защиты веток.

## 2. Настройка и конфигурация Terraform

Для выполнения задания были созданы конфигурационные файлы Terraform, описывающие желаемое состояние инфраструктуры (репозитория GitHub).

### `variables.tf`
Этот файл определяет переменные, используемые в конфигурации, такие как токен для аутентификации, имя пользователя и название репозитория. Использование `sensitive = true` для токена предотвращает его отображение в логах.

```terraform
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
```

### `main.tf`
Основной файл конфигурации, который описывает провайдера `github` и ресурсы для создания.

- **`github_repository.lab_repo`**: Создает новый публичный репозиторий с заданным именем, описанием и включенными опциями (issues, projects, wiki). Также устанавливает лицензию MIT.
- **`github_branch_default.main`**: Устанавливает `main` в качестве ветки по умолчанию.
- **`github_branch_protection.main_protection`**: Настраивает правила защиты для ветки `main`, требуя как минимум один одобряющий review для pull request, обязательную проверку статуса `ci/build` и запрещая удаление ветки.

```terraform
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

  has_issues   = true
  has_projects = true
  has_wiki     = true

  allow_merge_commit     = true
  allow_squash_merge     = true
  allow_rebase_merge     = true
  delete_branch_on_merge = true

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
```

## 3. Процесс развертывания

Развертывание инфраструктуры выполнялось в три этапа.

**1. Инициализация (`terraform init`)**
На этом шаге Terraform загружает и инициализирует необходимые плагины, в данном случае — провайдер для GitHub.

---
**[ПЛЕЙСХОЛДЕР ДЛЯ СКРИНШОТА]**

*Здесь должен быть скриншот успешного вывода команды `terraform init`.*

---

**2. Планирование (`terraform plan`)**
Команда анализирует конфигурацию и составляет план действий, который показывает, какие ресурсы будут созданы, изменены или удалены.

---
**[ПЛЕЙСХОЛДЕР ДЛЯ СКРИНШОТА]**

*Здесь должен быть скриншот вывода команды `terraform plan`, демонстрирующий план создания 3 ресурсов.*

---

**3. Применение (`terraform apply`)**
Эта команда выполняет план, создавая и настраивая репозиторий на GitHub в соответствии с описанием в `.tf` файлах.

---
**[ПЛЕЙСХОЛДЕР ДЛЯ СКРИНШОТА]**

*Здесь должен быть скриншот вывода команды `terraform apply -auto-approve`, показывающий успешное создание ресурсов.*

---

## 4. Результат

В результате выполнения скрипта Terraform был успешно создан и настроен публичный репозиторий на GitHub.

---
**[ПЛЕЙСХОЛДЕР ДЛЯ СКРИНШОТА]**

*Здесь должен быть скриншот страницы созданного репозитория на GitHub, в идеале — страница с настройками защиты ветки `main`.*

---

**[ПЛЕЙСХОЛДЕР ДЛЯ ССЫЛКИ]**

*Здесь должна быть ссылка на созданный репозиторий: https://github.com/sowwds/terraform-lab-repo*

---

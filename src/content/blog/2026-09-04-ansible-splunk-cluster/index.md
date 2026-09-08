---
title: "Automating Splunk Enterprise Infrastructure with Ansible"
summary: "How I automated the deployment and configuration of a multi-component Splunk Enterprise environment using Ansible, reusable roles, and infrastructure-as-code principles."
date: "2026-09-04"
draft: false
tags:
- Ansible 
- AWS 
- Splunk
- Splunk Enterprise 
- IaC
- Automation
- DevOps
- Linux
---
Managing a distributed Splunk environment becomes increasingly complex as more components are introduced.

What starts as a few Splunk servers can quickly grow into an environment containing clustered indexers, Search Heads, a Cluster Manager, a Search Head Deployer, a Deployment Server, Heavy Forwarders, Universal Forwarders, license management, TLS, and firewall configuration.

For this project, I wanted to explore how **Ansible could be used to automate the deployment and configuration of a multi-component Splunk Enterprise environment while making it more consistent and reproducible**.

Rather than manually configuring each Splunk server, I designed the environment around reusable Ansible roles and a central orchestration playbook.

The complete implementation is available in my GitHub repository:

[ansible-splunk-cluster on GitHub](https://github.com/michaelsayala/ansible-splunk-cluster?utm_source=chatgpt.com)

This post focuses on the **architecture, automation strategy, design decisions, and lessons learned**. The repository contains the detailed implementation and configuration.

---

## Why I Built This

I wanted to approach Splunk deployment from an **Infrastructure as Code** perspective.

In a distributed environment, many components depend on one another, and configuration needs to remain consistent across multiple servers.

Manually performing these tasks is possible, but it becomes increasingly difficult to reproduce the environment and easier to introduce configuration differences between nodes.

The goal of this project was therefore not simply to install Splunk with Ansible.

Instead, I wanted to:

> **Use Ansible to define and automate the configuration of an entire distributed Splunk environment.**

The environment includes:

* 1 Cluster Manager
* 3 Indexers
* 3 Search Heads
* 1 Search Head Deployer
* 1 Deployment Server
* 1 License Manager
* 2 Heavy Forwarders
* 2 Universal Forwarders

This provided enough complexity to explore how Ansible could manage different Splunk roles while keeping the automation organized and maintainable.

---

## Architecture

The environment is organized around an indexer tier, search tier, forwarding tier, and supporting Splunk services.

```text id="h3w2s9"
                         ┌─────────────────────┐
                         │   Search Head       │
                         │      Cluster        │
                         │ SH1 / SH2 / SH3     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Indexer Cluster   │
                         │ IDX1 / IDX2 / IDX3  │
                         └──────────▲──────────┘
                                    │
                             Indexer Discovery
                                    │
                         ┌──────────┴──────────┐
                         │   Cluster Manager   │
                         │         CM1         │
                         └─────────────────────┘


       ┌─────────────────────┐       ┌─────────────────────┐
       │  Deployment Server  │       │  Search Head        │
       │        DS1          │       │     Deployer        │
       └──────────┬──────────┘       │        DP1           │
                  │                  └─────────────────────┘
                  ▼
           ┌─────────────┐
           │ Universal   │
           │ Forwarders  │
           │  UF1 / UF2  │
           └─────────────┘


       ┌─────────────────────┐
       │  Heavy Forwarders  │
       │     HF1 / HF2      │
       └──────────┬──────────┘
                  │
                  ▼
           Indexer Cluster


       ┌─────────────────────┐
       │    License Manager  │
       │         LM1         │
       └─────────────────────┘
```

The architecture was intentionally designed to include multiple Splunk roles rather than focusing only on the indexer and search tiers.

This provided an opportunity to automate not only the core Splunk platform but also the supporting configuration required around it.

---

## Designing the Automation

The main design decision was to organize the automation into **reusable Ansible roles**.

Instead of creating one large playbook containing every task, responsibilities are separated into individual roles.

For example:

```text id="z7x3k1"
roles/
├── firewall
├── splunk_common
├── splunk_install
├── splunk_cluster_manager
├── splunk_indexer_cluster
├── splunk_indexer_cluster_discovery
├── splunk_search_head_cluster
├── splunk_search_head_indexer_cluster
├── splunk_deployer
├── splunk_deployment_server
├── splunk_install_universal_forwarder
├── splunk_license_manager
├── splunk_license_peer
├── splunk_ssl
└── ...
```

This separation allows common functionality to be reused while keeping component-specific configuration isolated.

For example, the Splunk installation role does not need to know whether the target machine will eventually become an indexer or Search Head.

The installation role handles the installation, while the component-specific roles handle the configuration that follows.

This makes the project easier to maintain and extend.

[Explore the Ansible roles on GitHub](https://github.com/michaelsayala/ansible-splunk-cluster/tree/main/roles?utm_source=chatgpt.com)

---

## Treating the Inventory as Architecture

Another important part of the design is the Ansible inventory.

The inventory does not simply contain a list of IP addresses. It represents the logical Splunk architecture through groups such as:

```text id="u4k2n8"
cluster_manager
indexers
search_heads
deployer
deployment_server
license_manager
heavy_forwarders
universal_forwarders
```

This makes the playbook easier to understand.

Instead of targeting individual servers throughout the automation, configuration can be applied according to the Splunk role represented by each host group.

For example:

```yaml id="e5tq2m"
hosts: indexers
```

means the configuration is intended for the indexer tier rather than a specific machine.

This approach also makes the environment easier to modify. Adding another indexer, for example, primarily becomes an inventory and configuration change rather than requiring a rewrite of the deployment logic.

[View the Ansible inventory](https://github.com/michaelsayala/ansible-splunk-cluster/blob/main/inventory.yml?utm_source=chatgpt.com)

---

## Orchestrating the Deployment

The central `site.yml` playbook provides the orchestration layer.

The deployment is divided into logical stages because the Splunk components have dependencies on one another.

The general workflow is:

```text id="p9v3w2"
Install Splunk
      │
      ▼
Common Configuration
      │
      ▼
Host / Firewall / TLS
      │
      ▼
License Configuration
      │
      ▼
Indexer Cluster
      │
      ▼
Search Head Cluster
      │
      ▼
Indexer Discovery
      │
      ▼
Deployment Server
      │
      ▼
Forwarder Configuration
```

The important concept here is that Ansible is not simply executing installation commands.

It is orchestrating the transition from **individual servers to a functioning distributed Splunk environment**.

[View site.yml on GitHub](https://github.com/michaelsayala/ansible-splunk-cluster/blob/main/site.yml.example?)

---

## Automating the Indexer and Search Tiers

The indexer tier consists of three indexers managed by a dedicated Cluster Manager.

For this environment, I configured a replication factor and search factor of 2.

From an automation perspective, the important part is consistency.

The same role and variable structure can be used across the indexer nodes rather than manually configuring each server.

The search tier follows a similar approach with three Search Heads and a dedicated Search Head Deployer.

The Search Heads are configured as a Search Head Cluster and connected to the Indexer Cluster.

This introduced one of the more interesting aspects of the project: **the automation needs to account for relationships between components, not just individual machines.**

The Search Heads depend on the indexer tier, while clustered components also require shared configuration and secrets.

Those dependencies influenced how I structured the deployment workflow.

---

## Forwarding and Configuration Management

The forwarding layer contains both Heavy Forwarders and Universal Forwarders.

The Heavy Forwarders provide an additional processing and forwarding layer before data reaches the indexer cluster.

The Universal Forwarders are managed through the Deployment Server.

Conceptually:

```text id="w7q1s4"
Data Sources
     │
     ▼
Universal Forwarders
     │
     ▼
Heavy Forwarders
     │
     ▼
Indexer Cluster
     │
     ▼
Search Head Cluster
```

This also highlights an important distinction in the architecture.

**Ansible manages the infrastructure and initial Splunk configuration.**

**The Splunk Deployment Server manages configuration distribution to forwarder clients.**

These are complementary automation layers rather than competing approaches.

---

## Indexer Discovery

I also incorporated Indexer Discovery into the forwarding architecture.

Instead of relying exclusively on static indexer destinations, components can use the Cluster Manager as the discovery mechanism.

This makes the forwarding configuration less tightly coupled to individual indexer addresses and better represents how a distributed environment can be managed.

The repository includes a dedicated role for this configuration.

[View the Indexer Discovery role](https://github.com/michaelsayala/ansible-splunk-cluster/tree/main/roles/splunk_indexer_cluster_discovery?)

---

## Security and Secrets

Security was treated as part of the deployment rather than something added after the environment was working.

The project includes automation for areas such as:

* SSL/TLS
* Firewall configuration
* Splunk shared secrets
* Host resolution
* Component communication

Sensitive values such as administrator credentials and cluster secrets should never be committed to a public repository.

For a production implementation, I would manage those values using **Ansible Vault or a dedicated secrets-management platform**.

This is an important principle for Infrastructure as Code projects:

> Configuration should be reproducible without exposing credentials.

---

## What I Learned

The biggest lesson from this project was that automation changes how you approach infrastructure.

When working manually, it is easy to think in terms of individual servers:

> Configure the indexer.

> Configure the Search Head.

> Configure the forwarder.

With automation, the questions become:

* What is the desired state?
* Which components depend on each other?
* Which configuration should be reusable?
* Which values should be variables?
* Where should configuration responsibilities live?
* How can the environment be reproduced?

That shift from **server-by-server administration to environment-level design** was one of the most valuable parts of this project.

It also reinforced the importance of separating infrastructure provisioning from platform configuration.

Terraform and Ansible solve different parts of the problem, and using them together creates a more structured deployment workflow.

---

## Terraform + Ansible: Two Layers of Infrastructure as Code

One of the most important aspects of this project is that it is not isolated from my Terraform work.

I built the Terraform project to provision the AWS infrastructure required for the distributed Splunk environment.

This Ansible project then builds on that infrastructure to install and configure Splunk.

The relationship can be summarized as:

```text
                    Infrastructure as Code
                             │
              ┌──────────────┴──────────────┐
              │                             │
          Terraform                       Ansible
              │                             │
              ▼                             ▼
       AWS Infrastructure           Splunk Configuration
              │                             │
              ▼                             ▼
       VPC / EC2 / SG              Clustering / TLS / Apps
              │                             │
              └──────────────┬──────────────┘
                             ▼
                 Distributed Splunk
                    Enterprise
```

This separation makes the overall environment easier to reason about.

**Terraform answers:**

> What infrastructure should exist?

**Ansible answers:**

> How should that infrastructure be configured?

This is a pattern I would use for larger environments where cloud infrastructure and application configuration need to be managed independently.


---

## Future Improvements

There are several areas I would continue developing.

### Automated validation

Post-deployment validation could verify that:

* Splunk services are running
* Required ports are available
* Indexers joined the cluster
* Search Heads joined the SHC
* Forwarders connected to the Deployment Server
* Components can communicate correctly

### CI/CD

GitHub Actions could be added for:

* YAML validation
* Ansible linting
* Syntax checks
* Automated testing

### Certificate automation

The TLS implementation could be expanded to automate certificate generation, distribution, renewal, and replacement.

---

## Explore the Project

The blog provides the architecture and engineering perspective, while the GitHub repository contains the actual implementation.

If you want to explore the project, I recommend starting with the repository README and then reviewing the inventory, variables, `site.yml`, and individual Ansible roles.

[View the complete ansible-splunk-cluster project on GitHub](https://github.com/michaelsayala/ansible-splunk-cluster?)

---

## Final Thoughts

This project was an opportunity to combine several areas I enjoy working with: **Splunk, Linux, Ansible, AWS, security, and infrastructure automation**.

The objective wasn't simply to create another Splunk lab.

It was to explore how a distributed Splunk environment could be treated as **code**.

By representing the infrastructure, configuration, relationships, and deployment workflow through Ansible, the environment becomes easier to reproduce, modify, and extend.

There is still plenty of room to improve the project, particularly around testing, certificate lifecycle management, secrets management, CI/CD, and cloud provisioning.

For me, that's what makes this project valuable.

It's not just about getting Splunk running.

It's about continuously improving how infrastructure is **designed, automated, secured, and maintained**.

**Project:**
[Ansible Repository](https://github.com/michaelsayala/ansible-splunk-cluster?)

**Explore the Terraform:**
[Terraform Repository](https://github.com/michaelsayala/terraform-aws-splunk-cluster?)

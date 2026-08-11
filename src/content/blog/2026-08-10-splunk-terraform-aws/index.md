---
title: "Building a Distributed Splunk Enterprise Environment on AWS with Terraform"
summary: "A practical walkthrough of building a distributed Splunk Enterprise environment on AWS using reusable Terraform modules, networking, security groups, and EC2 infrastructure."
date: "2026-08-10"
draft: false
tags:
- Terraform 
- AWS 
- Splunk
- Splunk Enterprise 
- IaC
- Automation
- DevOps
---
## Technology Stack

The main technologies used in the project are:

| Technology          | Purpose                                      |
| ------------------- | -------------------------------------------- |
| Terraform           | Infrastructure as Code                       |
| AWS VPC             | Network infrastructure                       |
| AWS EC2             | Splunk compute infrastructure                |
| AWS Security Groups | Network access control                       |
| Linux               | Server operating system                      |
| Splunk Enterprise   | Distributed SIEM and log management platform |
| Git                 | Source control                               |

---

# Terraform Workflow

The deployment process is intentionally straightforward.

First, initialize Terraform:

```bash
terraform init
```

Then validate the configuration:

```bash
terraform validate
```

Format the Terraform code:

```bash
terraform fmt -recursive
```

Review the proposed infrastructure:

```bash
terraform plan
```

Deploy the environment:

```bash
terraform apply
```

When the lab is no longer required:

```bash
terraform destroy
```

This workflow makes it possible to recreate the infrastructure without manually rebuilding each AWS resource.

---

# Challenges and Lessons Learned

One of the most valuable parts of this project was refactoring the Terraform configuration as the project became more complex.

It wasn't simply a matter of writing the resources once and having everything work perfectly.

I encountered several Terraform issues along the way.

## Hardcoded Resource Names

Initially, my indexer instances all received the same Name tag:

```hcl
Name = local.indexer_ec2_name
```

The problem was that `local.indexer_ec2_name` represented a single value:

```text
splunklab-dev-indexer-ec2
```

Since the resource used:

```hcl
for_each = toset(local.indexers)
```

all three EC2 instances received the same name.

I changed the naming logic to use `each.key`:

```hcl
Name = "${local.indexer_name_prefix}-${each.key}"
```

Now the instances are uniquely identified:

```text
splunklab-dev-indexer-idx1
splunklab-dev-indexer-idx2
splunklab-dev-indexer-idx3
```

This was a good example of how Terraform's iteration model affects resource configuration.

---

## Module Outputs

Another issue I encountered was trying to reference a value from a module that had not been exposed through an output.

For example, the root configuration attempted to use:

```hcl
module.networking.vpc_cidr
```

but Terraform reported that the module did not have a `vpc_cidr` attribute.

The solution was to explicitly expose it from the networking module:

```hcl
output "vpc_cidr" {
  value = aws_vpc.this.cidr_block
}
```

This reinforced an important Terraform concept:

> A module can only expose values to its caller through outputs.

---

## Terraform State and Existing Resources

I also encountered duplicate AWS resources during development.

For example, Terraform attempted to create a security group that already existed in the VPC.

This highlighted the importance of understanding Terraform state.

Terraform doesn't simply look at AWS and automatically know which resources it should manage. It uses its state to track resources.

When working with existing infrastructure, you need to determine whether the resource should be:

* Imported into Terraform
* Deleted and recreated
* Or managed outside of Terraform

Understanding this becomes increasingly important as Terraform projects move beyond simple lab environments.

---

# Security Considerations

Because this project is publicly available on GitHub, keeping credentials and sensitive information out of the repository is critical.

The repository excludes files such as:

```text
terraform.tfvars
*.tfstate
*.tfstate.*
.terraform/
*.tfplan
```

AWS credentials should never be stored in the Terraform code.

Private SSH keys should also never be committed.

Instead, users deploying the project should create their own AWS EC2 key pair and provide the required public key configuration.

This makes the repository safe to share while still providing enough information for another user to deploy their own environment.

---

# What I Would Improve for Production

This project is primarily a lab and portfolio implementation, so there are several areas I would change before considering a production deployment.

## Private Networking

The current environment uses a public subnet to simplify the lab.

A production architecture should separate workloads into public and private subnets.

For example:

```text
VPC
 |
 +-- Public Subnets
 |      |
 |      +-- Internet-facing resources
 |
 +-- Private Subnets
        |
        +-- Splunk Indexers
        +-- Search Heads
        +-- Cluster Manager
        +-- Supporting components
```

This would reduce direct exposure of internal Splunk components.

## Remote Terraform State

A production Terraform implementation should use a remote backend with appropriate state protection and locking.

## CI/CD and Validation

The Terraform workflow could later be integrated into a CI/CD pipeline to automatically validate configuration and review infrastructure changes before deployment.

## Secrets Management

Sensitive values should be managed through a dedicated secrets management solution rather than Terraform variables stored in source control.

---

# The Next Step: Terraform + Ansible

One of the biggest opportunities for this project is combining Terraform with Ansible.

Terraform is responsible for provisioning the infrastructure:

```text
Terraform
    |
    v
AWS VPC
    |
    v
Security Groups
    |
    v
EC2 Instances
```

Ansible can then take over:

```text
EC2 Instances
    |
    v
Ansible
    |
    +-- Install Splunk
    +-- Configure Splunk
    +-- Configure Cluster Manager
    +-- Configure Indexers
    +-- Configure Search Heads
    +-- Configure Forwarders
```

This would create a much more complete automation workflow.

Instead of manually provisioning infrastructure and then manually installing Splunk, the entire environment could eventually be deployed through automation.

That is the direction I plan to take this project next.

---

# Conclusion

This project started as an AWS and Terraform lab, but it became an opportunity to combine my Splunk experience with cloud infrastructure and Infrastructure as Code.

The most important lesson was not simply learning how to create an EC2 instance with Terraform.

It was learning how to structure infrastructure so that it is:

* Reusable
* Configurable
* Maintainable
* Version controlled
* Easier to automate

Using Terraform modules, variables, locals, outputs, and `for_each` helped turn a collection of AWS resources into a more structured infrastructure project.

The next phase is to integrate Ansible for Splunk installation and configuration, creating an end-to-end workflow from AWS infrastructure provisioning to a fully configured distributed Splunk environment.

---

## Project Source Code

The complete project is available on GitHub:

https://github.com/michaelsayala/terraform-aws-splunk-cluster

The repository includes the Terraform modules, environment configuration, architecture diagram, and deployment documentation.

If you're interested in Splunk, AWS, Terraform, or Infrastructure as Code, feel free to explore the project and adapt the approach to your own lab environment.

Contributions, suggestions, and feedback are always welcome.
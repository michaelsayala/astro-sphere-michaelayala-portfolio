---
title: "Splunk Enterprise Distributed Deployment on AWS with Terraform"
summary: "Terraform-based deployment of a distributed Splunk Enterprise environment on AWS, using reusable modules for VPC, public subnet, route table, Internet Gateway, security groups, and EC2 infrastructure."
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
repoUrl: https://github.com/michaelsayala/terraform-aws-splunk-cluster
---

This project demonstrates the deployment of a distributed Splunk Enterprise environment on AWS using Terraform and Infrastructure as Code principles. The infrastructure is organized into reusable Terraform modules for networking, security groups, and compute resources, enabling consistent and repeatable deployments.

The environment provisions the AWS infrastructure required to support a distributed Splunk architecture, including VPC networking, subnets, route tables, Internet Gateway, security groups, and EC2 instances. The Splunk deployment includes an Indexer Cluster, Search Head Cluster, Cluster Manager, Deployer, Deployment Server, License Manager/DMC, Heavy Forwarders, and Universal Forwarders.

The project is designed as a practical demonstration of Splunk infrastructure engineering, AWS cloud architecture, Terraform module design, and infrastructure automation.

---
title: "Beginning DevOps - Day 2"
description: "Load balancing, VPC, Auto Scaling etc."
date: 2020-05-27
---

In the [previous post](/read/beginning-dev-ops-day-1), I talked about the first things I learnt in the AWS training. You should read that before reading this.

---

## Today so far...

I started the AWS integrated service module after completing the core services module yesterday. Interestingly the whole course is just 6 hours long, well, I'm not in a haste so I'll take my time to understand every concept clearly.

The integrated service module which I haven't completed yet is an interesting one. The integrated services are aws provided services that aids the smooth flow of activities in your instance. I learned about auto scaling, load balancing, relational databases and route 53.

### VPC

This is the virtual private cloud that provides an isolated environment for our instances. You can think of it like an vpn controlled environment, i.e, you can only access it privately and not publicly like basic ec2 instances.

The VPC is essential for users who work with sensitive data such as the banks, healthcare service providers, etc.

### Load Balancing

I didn't get this at first, but it's basically like the name. The amazon load balancer helps in the routing of requests from a connection using a configured **listener** to a defined **target**.

You can think of the load balancer as a middleman that sorts and directs request from various sources to their destinations.

### Auto scaling

Like the load balancer, auto scaling deals with managing the instances running based on defined instructions, 80% utilisation of your CPU power etc. The auto scaling is useful because it prevents your workload from crashing due to over utilisation of CPU and other unforeseen circumstances.

There are two classes of auto scaling:

1. Auto scaling out: When there's a scale out operation carried out, the number of instances are increased.
2. Auto scaling in: When there's a scale in operation carried out, some instances are terminated to reduce the workload on the CPU.

Auto scaling is carried out based on policies set by the user.

### Route 53

Amazon provides DNS routing services. The route 53 service is used to allocate to a domain an amazon ec2 instance IP address, domain names can be bought and registered in route 53 too.

### Amazon Relational Database Services

AWS provides access to relational database services such as MySQL, MongoDB, MariaDB etc. They also provide backup services that asynchronously updates the backup database on every update passed to the main database.
The RDS provides the backed up data in unfortunate cases such as database crashes etc. 

The RDS is essential for applications that make use of data. This service is provided in-house so users can host every part of their app in aws and in the cloud. That's cool.

### AWS Lambda

Like lambda functions, aws lambda functions work only when they're triggered. The AWS lambda is used mostly for serverless computing i.e, a lambda instance is only run when there's a direct call to it.

Unlike traditional servers where your application runs every time and as a result cost you money, aws lambda runs only when it receives a request passed to it and you're billed only when the service is used. Nice!

### Elastic Beanstalk

The elastic beanstalk is used to automate the process of deployment of one's code. Like a normal beanstalk, the elastic beanstalk is a Platform as a Service ( PaaS ) infrastructure. You only need to write your code alongside the build instruction, package it and upload it in the beanstalk application in your aws console.

If you have another version of the deployed code, you only need to upload the code, and the upgrade and deployment process is fully automated.

## So..

That's that for the day, I'll be finishing the module tomorrow where I'll be learning about the simple notification service, cloudwatch, cloudformation and cloudfront. Until then.

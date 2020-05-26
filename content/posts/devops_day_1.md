---
title: "Beginning DevOps - Day 1"
description: "Beginning a new path in the world of IT: DevOps."
date: 2020-05-26
---

In the [previous post](./confusef.md), I stated that I'll be deciding what part to take next. Well, I'll be working on a path to becoming a DevOps engineer. I started today and this post is about what I have done today.

## Yesterday,

I got a reference article from my new virtual mentor that discusses the pathway to DevOps, it was a four part article with detailed information on what DevOps is about, skillsets needed, platforms used etc.

DevOps can be said to be engineering cloud infrastructures and automating application and software developments and productions via _pipelines_. It basically is building systems virtually in a confined environment ( this is what I understand from what I've seen today).

> Pipelines ( to me ) is the path followed by the application to deployment. Since well, pipes carry material and in DevOps, these pipelines refers to set of automated instructions and co.

The three fundamental requirements to becoming a SevOps engineer are:

+ Solid understanding of the cloud and how it works - Aws, Google Cloud etc
+ Solid understadning of the Linux ( Unix type ) operating system.
+ Solid understanding of a scripting language such as Python, Go etc.

I only pass the last two requirements above and I'll be learning what the Cloud is all about, AWS is more popular but an idea of both is good. I believe the cloud works the same way, bunch of instances, buckets etc. I also will be furthering my knowledge of both Python and Go: there isn't any specific language choice for DevOps but these two are recommended.

---

## Today,

I began learning what the cloud is all about at the [AWS training website](https://aws.training) and so far I have completed the **Introduction to Cloud** and **AWS Core services** modules. In those two modules, I learnt what an instance is, volumes, buckets as well as VPC. I also learnt how to use **ssh**.

### Elastic Compute Cloud

I learned about the Elastic Compute CLoud ( EC2 ) which is a virtual machine hosted in the cloud ( cloud - physical servers not in your reach ). The EC2 instances are containers containing these virtual machiens - usually Linux, you could build your own image too. I also learned about connecting to my EC2 instances on my machine locally, attaching IAM roles to allow specific operations defined by me on the EC2 console. I also learned about regions and available zones

The EC2 instacnes are machiens where you can perform all linux operations such as file operations, code running etc. You also get to access your s3 bucket from it if your aws has been configured and all the necessary permissions and roles have been set.

### Simple Service Storage

The S3 is basically a file server from Amazon, Google also offers smoething similar. I learned how to create S3 buckets and upload data from it both online and locally using the aws cli. You can also access the bucket from your EC2 instance and locally.

### AWS cli

The installation of the cli was quite straightforward. I also configured it with the details I got from creating a user from the aws console. I am yet to explore all the available use case of the cli just yet. I definitely will use it more as I journey into DevOps. I used it to list the available buckets, upload files to it and sync through the buckets. It's an amazing cli so far.

### Yup

Today was very interesting, learned so many things, made mistakes and corrected them. I read docs and googled what I didn't understand too. I hope I'm not too excited but I mean, spending all my day on my terminal is so fulfilling tbh, I hope DevOps isn't too hard and these fundamentals aren't deceiving me sha. Well, I'll continue to update the blog with my daily* learnings.

> daily* - it might be sequential or a progression.

Thanks for reading!

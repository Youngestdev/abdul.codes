--- 
title: "Building an open source OPA management application."
description: "I happen to be in charge of leading the build process for an open policy agent management application. The project is currently being built by myself and my coworker."
date: 2022-06-08
---

> I'm attempting to run my engineering processes on my blog.

The policy management application is born from the need to manage Open Policy Agent ( OPA ) policies written in [REGO](https://www.openpolicyagent.org/docs/latest/policy-language/) from a user interface for non-technical users and an API through JSON for technical users.

The users of this policy management application are thereby classified into two:

- Non-technical users.
- Technical users: developers ideally.

# User definitions

## Non-technical users

These ideally are system administrators or anyone who is tasked with managing authorization rules for a defined resource and has no prior experience writing REGO or is not a programmer.

## Technical users

These are developers who can interact with the API directly and manage their policies with JSON. The API has been built to translate JSON to REG0 and can be used as a standalone i.e interacting with our hosted version or forked and used in-house.

> It is important to note that the JSON sent adheres to the structure defined by the [API standards](https://github.com/r-scheele/rego_builder/issues/1).
> 

# API Design

The API design for the management of the policies is split into three sections:

- Translating JSON to REGO
- CRUD operations for policies for persistence.
- GitHub integration.

> Setting the API up can be found [here](https://github.com/r-scheele/rego_builder#installation).
> 

## Translating JSON to REGO

A set of functions, let’s call them the **translator logic**, do the job of creating the REGO policies. These functions are stored [here - WIP documentation].

The JSON translated to REGO as stated earlier must conform to defined standards. A rule is defined in this manner:

```py
{
  "command": "input_prop_equals",
  "properties": {
    "input_property": "request_method",
    "value": "GET"
  }
}
```

The `command` key represents the operation to be defined as REGO. In this example, `input_prop_equals` translates to the assignment property `==`. The list of commands and their definition is explained [WIP - Documentation By Habeeb].

The JSON above translates to the following in REGO:

```jsx
input.request_method == "GET"
```

## CRUD Operations

The API is built to accommodate all CRUD operations. The list of routes defined currently are:

- `/policies`: List all policies created by a user.
- `/policies`: **POST** route for adding a new policy.
- `/policies/{policy_id}`: route for **GET**, **UPDATE** and **DELETE** operations respectively.

The request lifecycle for a **POST** request is illustrated thus:

![Untitled](https://res.cloudinary.com/laisi/image/upload/v1654718824/Untitled_myacve.png)

Each request sent to the API is made to pass through a series of checks:

- The validity of the request body, thanks to Pydantic model validations.
- The uniqueness of the policy. If such a policy exists, an HTTP 409 is returned. In such a case, it’ll be ideal to use the **UPDATE** route.

> A concise explanation of how requests are sent and their responses can be viewed in this [PR](https://github.com/r-scheele/rego_builder/pull/5#issue-1245453527). [ A more concise one is one the way - WIP DOC.]
> 

## GitHub integration

The primary design of the API is targeted at users who want to manage their OPA policies stored in a repository. 

As such, on initialization of the API and signing into the client on the frontend, a repo is supplied and policies go through either of the CRUD operations when subjected to either from the API/UI client.

### Concern.

Primarily, the repository is defined as an environment variable alongside the tokens needed to carry out operations. In order to allow the frontend client set the data, I’m proposing the following options:

- Create a route on the backend that allows the frontend set the data needed for the settings. This can as well be done on the `/authorize` route and then return the settings instance which will then be used all through the application.
- Eliminate the use of environment variables to set GitHub repository variables and instead retrieve them from an injected dependency. This option will create an additional layer of work for users who prefer to use **Personal Access Tokens** to manage their activities as opposed to **Signing in every 8 hours to use the API**.

> The problem above is set to medium priority and will be focused on after the UI screens are complete. For now, the repository configuration remains in the backend.
> 

# Todo for the API.

- Fully integrate the GitHub authentication to allow multiple users make changes from the frontend - WIP.
- Concise documentation covering the technical specs and the how-tos of the API - WIP.
    - Highlight installation steps for users who wish to self-host the API.
- Like `pygeoapi`, provide a CLI tool/option that enables users to convert JSON files to REGO files.

# Frontend Client

The frontend client application is currently a [WIP](https://app-demo-youngestdev.cloud.okteto.net/). It is being built primarily for non-technical users to enable them to manage their policies.

The current screen available for the frontend is:

- Create policy
    
    ![Untitled](https://res.cloudinary.com/laisi/image/upload/v1654718814/Untitled_1_ofsozv.png)
    

![Screenshot 2022-06-08 at 10.40.10.png](https://res.cloudinary.com/laisi/image/upload/v1654718827/Screenshot_2022-06-08_at_10.40.10_fxftq5.png)

- View policy
    
    ![Screenshot 2022-06-08 at 10.42.19.png](https://res.cloudinary.com/laisi/image/upload/v1654718827/Screenshot_2022-06-08_at_10.42.19_xjo7it.png)
    

The UPDATE and DELETE routes are currently a **WIP**.

## Todo for the Frontend

- Implement UPDATE and DELETE screens.
- Complete **Sign in with GitHub**

# Authorization

To disallow retrieval of policies by just anybody, the Sign in with GitHub will be used to retrieve user data which will, in turn, be used to store data and act as an accessor when attempting to perform any operation.

The headers for authorization will *most likely* be encoded in JWT format. This is still undergoing deliberation - myself and Habeeb.

#!/bin/bash



default="---
title: $*
description: Fix a description.
date: $(date +%Y-%m-%d)
---"


echo -e $default > content/posts/"$@".md

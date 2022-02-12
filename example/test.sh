#!/usr/bin/env bash
# Test example in a container similar to the runner
W=/workspace/
C=$(docker container create --rm -w $W ghcr.io/codewars/lambda-calculus:latest npx mocha)
docker container cp ./solution.lc $C:$W
docker container cp ./test.js $C:$W
docker container start --attach $C

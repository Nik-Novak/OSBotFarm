#!/bin/bash

./transfer-api.sh
(cd docker && ./build.sh && ./run.sh 8000)

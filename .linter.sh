#!/bin/bash
cd /home/kavia/workspace/code-generation/petcareplanner-27008-2381431b/petcare_scheduler
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi


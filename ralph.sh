#!/bin/bash
# ralph.sh - AFK (Away From Keyboard) Ralph
# Run multiple autonomous iterations
# Usage: ./ralph.sh <iterations>
# Example: ./ralph.sh 10

set -e

if [ -z "$1" ]; then
  echo "❌ Error: Number of iterations required"
  echo "Usage: $0 <iterations>"
  echo "Example: $0 10"
  exit 1
fi

ITERATIONS=$1
echo "🤖 Starting AFK Ralph with $ITERATIONS iterations..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for ((i=1; i<=$ITERATIONS; i++)); do
  echo ""
  echo "🔄 Iteration $i/$ITERATIONS"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  result=$(claude -p "@prd.json @progress.txt @SAAS_ROADMAP.md

You are working on the Ad Assets Generator SaaS Platform v1.0.

QUALITY STANDARDS:
This is production code that will be maintained long-term.
- Write maintainable, clean code
- Follow existing patterns in the codebase
- Add proper error handling
- Follow TypeScript best practices
- Maintain brutalist design aesthetic
- Never take shortcuts on security
- Every shortcut becomes technical debt
- Patterns you establish will be copied

YOUR TASK FOR THIS ITERATION:
1. Review prd.json to see all available tasks
2. Review progress.txt to see what has been completed
3. Review SAAS_ROADMAP.md to understand project context
4. Choose the HIGHEST PRIORITY task from prd.json that has 'passes': false
   - Prioritize P0 tasks over P1 tasks
   - Prioritize risky/architectural tasks over simple tasks
   - Prioritize integration points over isolated features
   - Prioritize security over features
5. Check feedback loops BEFORE starting work:
   - Run: npm run typecheck
   - Run: npm run lint
   - Fix any existing errors before proceeding
6. Implement the task you chose
7. Run ALL feedback loops to verify your work:
   - npm run typecheck (must pass with 0 errors)
   - npm run lint (must pass with 0 errors)
   - If tests exist: npm test (must pass)
8. Update progress.txt with:
   - Task ID and description you completed
   - Key decisions made and why
   - Files changed
   - Any blockers or notes for next iteration
   - Keep it concise, sacrifice grammar for brevity
9. Update prd.json:
   - Change 'passes' to true for completed task
   - Add any notes about implementation
10. Make a git commit with descriptive message
11. If ALL tasks in prd.json have 'passes': true, output <promise>COMPLETE</promise>

IMPORTANT RULES:
- Work on ONLY ONE task per iteration
- Keep changes small and focused
- Do NOT commit if any feedback loop fails - fix issues first
- If a task is too large, break it into subtasks in prd.json
- Quality over speed - this code will outlive you
- Fight entropy, leave code better than you found it
- Never skip feedback loops
- Never commit broken code
")

  echo "$result"

  # Check for completion signal
  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ All PRD tasks complete! Ralph is done."
    echo "📊 Total iterations used: $i/$ITERATIONS"
    exit 0
  fi

  echo "✓ Iteration $i complete"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  Reached maximum iterations ($ITERATIONS)"
echo "📝 Check progress.txt and prd.json for current state"
echo "🔄 Run again to continue: ./ralph.sh <iterations>"

# Ralph Wiggum - Autonomous AI Coding

This project uses Ralph Wiggum for autonomous, long-running AI coding sessions based on the approach described in [AI Hero's guide](https://www.aihero.dev/tips-for-ai-coding-with-ralph-wiggum).

## What is Ralph?

Ralph is a loop-based approach to AI coding where the AI autonomously works through a list of tasks defined in a PRD (Product Requirements Document). Instead of writing new prompts for each phase, you define the end state and Ralph figures out how to get there.

## Files Overview

- **`prd.json`** - Product Requirements Document containing all tasks to be completed
- **`progress.txt`** - Progress log that tracks completed work across iterations
- **`ralph-once.sh`** - HITL (Human-In-The-Loop) script for running single iterations with oversight
- **`ralph.sh`** - AFK (Away From Keyboard) script for running multiple autonomous iterations
- **`SAAS_ROADMAP.md`** - High-level roadmap providing project context

## Quick Start

### 1. HITL Mode (Recommended to start)

Run a single iteration and watch what happens:

```bash
./ralph-once.sh
```

Use this to:
- Learn how Ralph works
- Refine your prompt
- Test on risky tasks
- Build confidence before going AFK

### 2. AFK Mode (Once you trust the setup)

Run multiple iterations autonomously:

```bash
./ralph.sh 10    # Run 10 iterations
./ralph.sh 30    # Run 30 iterations for larger work
```

**Always cap your iterations.** Never run infinite loops with stochastic systems.

## The Ralph Loop

Each iteration Ralph:
1. ✅ Reviews `prd.json` to see available tasks
2. ✅ Reviews `progress.txt` to see what's already done
3. ✅ Chooses the highest priority task
4. ✅ Checks feedback loops (types, linting)
5. ✅ Implements the task
6. ✅ Runs all feedback loops again
7. ✅ Updates `progress.txt` with progress notes
8. ✅ Updates `prd.json` marking task as complete
9. ✅ Makes a git commit
10. ✅ Exits when all tasks have `"passes": true`

## PRD Structure

The `prd.json` file uses this structure:

```json
{
  "id": "TASK-001",
  "category": "security",
  "description": "What needs to be done",
  "steps": [
    "Step 1 to verify completion",
    "Step 2 to verify completion"
  ],
  "passes": false,
  "priority": "P0",
  "estimatedComplexity": "medium"
}
```

- **`passes`**: `false` = not done, `true` = complete
- **`priority`**: P0 (critical) → P1 (important) → P2 (nice to have)
- **`category`**: Groups related tasks

## Priority Guidance

Ralph prioritizes tasks in this order:
1. **P0 tasks** (MVP-blocking, critical for launch)
2. **Risky/architectural tasks** (decisions that cascade)
3. **Integration points** (where modules connect)
4. **P1 tasks** (important but not blocking)
5. **P2 tasks** (nice to have)

## Feedback Loops

Ralph runs these checks before and after each task:

| Check | Command | Purpose |
|-------|---------|---------|
| TypeScript | `npm run typecheck` | Catch type errors |
| Linting | `npm run lint` | Code quality & consistency |
| Tests | `npm test` | Prevent regressions |

**Ralph will NOT commit if any feedback loop fails.**

## Quality Standards

This is production code. Ralph follows these principles:

- 🎯 **Maintainable code** - Others will read this
- 🔐 **Proper error handling** - No silent failures
- 🎨 **Follow existing patterns** - Consistency matters
- ⚡ **TypeScript best practices** - Type safety is not optional
- 🎭 **Brutalist design aesthetic** - Match the design system
- 🚫 **No shortcuts** - Technical debt compounds fast

## Tips for Success

### Start with HITL, Then Go AFK
1. Run `ralph-once.sh` first to watch and learn
2. Refine your prompt based on what you observe
3. Switch to `ralph.sh` once you trust the setup

### Define Clear Scope
- Vague tasks = infinite loops
- Specific acceptance criteria = clear completion
- Add edge cases to PRD steps

### Track Progress
- `progress.txt` helps Ralph skip exploration
- Git commits provide rollback points
- Small commits > large commits

### Adjust Mid-Flight
You can modify `prd.json` while Ralph runs:
- Mark `passes: false` if implementation was wrong
- Add new tasks as needed
- Update priorities

### Use Docker for AFK
The AFK script uses Docker sandbox:
```bash
docker sandbox run claude
```
This prevents Ralph from touching files outside the project.

## Typical Iteration Times

- Small task: 5-10 minutes
- Medium task: 15-30 minutes
- Large task: 30-60 minutes
- Full loop (10 iterations): 30-45 minutes

Set up notifications so you can work on something else while Ralph runs.

## Current Project Status

### Total Requirements: 30 tasks

**Priority Breakdown:**
- P0 (Critical): 13 tasks
- P1 (Important): 15 tasks
- P2 (Nice to have): 1 task

**Category Breakdown:**
- Security: 2 tasks
- Functional: 6 tasks
- UI: 5 tasks
- UX: 1 task
- Database: 2 tasks
- Payment: 2 tasks
- Legal: 3 tasks
- Infrastructure: 4 tasks
- Testing: 2 tasks
- Deployment: 1 task

## Monitoring Ralph

### Check Progress
```bash
# View progress log
cat progress.txt

# Check PRD status
cat prd.json | grep '"passes"'

# See git history
git log --oneline -20
```

### If Ralph Gets Stuck
1. Check `progress.txt` for blockers
2. Review last git commit
3. Check if feedback loops are passing
4. Adjust PRD or prompt as needed

## Cost Considerations

- Each iteration uses API credits
- HITL: Lower cost (you watch each iteration)
- AFK: Higher cost but massive leverage
- Set iteration limits to control spend
- Consider using smaller models (Haiku) for low-risk tasks

## Cleaning Up

When your sprint is done:
```bash
# Archive progress log
mv progress.txt progress-YYYY-MM-DD.txt

# Or delete it
rm progress.txt

# Start fresh next time
cp progress-template.txt progress.txt
```

## Resources

- [AI Hero: Ralph Wiggum Guide](https://www.aihero.dev/tips-for-ai-coding-with-ralph-wiggum)
- [Anthropic: Long-Running Agents](https://www.anthropic.com/research/building-effective-agents)
- Project Roadmap: `SAAS_ROADMAP.md`

## Need Help?

If Ralph:
- Skips tasks → Check priority guidance in prompt
- Cuts corners → Add explicit quality requirements
- Gets stuck in loops → Narrow scope in PRD
- Makes bad decisions → Use HITL mode to intervene

---

**Remember**: Ralph is just a loop. You define the end state. Ralph gets there. 🎯

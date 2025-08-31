# Cursor Rules Framework

## Core Principle
All rules derive from `authority.mdc` - the single source of behavioral truth.

## Rule Writing Guidelines

### Structure
- **One rule per file** - Keep focused and atomic
- **Start with authority reference** - Always link back to `authority.mdc`
- **Be brutally concise** - Max 5-7 lines per rule
- **Use imperatives** - "Do X" not "You should do X"

### Naming Convention
- Use kebab-case: `no-console-logs.mdc`
- Be descriptive: `prefer-async-await.mdc`  
- Avoid redundancy: `typescript.mdc` not `typescript-rules.mdc`

### Content Template
```mdc
---
description: Brief description of what this rule does
globs: ["path/pattern/*.js"]  # Optional: file patterns
alwaysApply: false  # or true for always-active rules
---

# Rule Name
> Authority: See authority.mdc

[2-3 line rule statement with action tags if needed]

## Example
[Optional: Single example if needed]
```

### Best Practices
- **Always active** - No conditional rules
- **Specific over general** - "Use const for immutable values" vs "Write good code"
- **Actionable** - Clear what to do, not what to avoid
- **No overlap** - One concern per rule

### Testing Your Rules
Ask: "Can I apply this immediately without interpretation?"
If no, make it more specific.

## Advanced Practices

### Action Tags
Use these for immediate behavioral control:
- **【STOP】** - Halt execution, require user input before proceeding
- **【CHOICE】** - Present options to user, stop until selection made
- **【VALIDATE】** - Mandatory verification checkpoint
- **【PLAN】** - Planning phase, no implementation yet

Example in rule:
```mdc
When creating new components:
1. 【PLAN】 Present component structure for approval
2. Create component files 【VALIDATE】 
3. Test component rendering 【STOP】 before proceeding
```

### Standard Workflow
**ALWAYS follow this sequence:**
1. **Plan** - Present implementation plan for user verification
2. **Implement** - Execute only after user approval
3. **Validate** - Test and verify the implementation

**Never change code on first reply without user verification of the plan.**

### Rule Reloading (Context Competition)
Combat context competition by using the `todo_write` tool during planning to embed rule reload tasks:

**During planning phases:**
- Use `todo_write` tool to create actual TODO tasks that force rule context refresh
- Embed reload triggers in multi-step implementation plans
- Create TODO tasks when switching domains or beginning complex operations

**Example workflow:**
```
1. User requests complex feature
2. Use todo_write tool to create planning tasks including rule reload triggers
3. Execute tasks in sequence, ensuring rules stay active throughout implementation
```

**When to embed reload tasks:**
- Starting new conversations or complex tasks
- Switching between file types or domains
- Beginning multi-step operations
- After rule modifications
